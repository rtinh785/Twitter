import { User } from '~/models/schemas/User.schema'
import { LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/request/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USER_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follow.schema'
import axios from 'axios'
import databaseService from '~/services/database.services'
import { sendEmail } from './email.services'

type SignAccessTokenParams = {
  user_id: ObjectId
  verify: UserVerifyStatus
  exp?: number
}
class UserService {
  private signAccessToken({ user_id, verify }: SignAccessTokenParams) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.AccesToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPRIRES_IN)
      }
    })
  }

  private signRefreshToken({ user_id, verify, exp }: SignAccessTokenParams) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          verify,
          token_type: TokenType.RefreshToken,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: Number(process.env.RERESH_TOKEN_EXPRIRES_IN)
      }
    })
  }

  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({ token: refreshToken, secretKey: process.env.JWT_SECRET_REFRESH_TOKEN })
  }

  private signVerifyEmailToken({ user_id, verify }: SignAccessTokenParams) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.verifyEmailToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_TOKEN as string,
      options: {
        expiresIn: Number(process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN)
      }
    })
  }

  private signAccessTokenAndRefreshToken({ user_id, verify, exp }: SignAccessTokenParams) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify, exp })])
  }

  private signForgotPasswordToken({ user_id, verify }: SignAccessTokenParams) {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: Number(process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN)
      }
    })
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signVerifyEmailToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })

    // SEND EMAIL VERIFY
    try {
      await sendEmail(payload.email, email_verify_token)
    } catch (error) {
      throw new ErrorWithStatus({
        message: (error as any).message,
        status: (error as any).statusCode
      })
    }

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: new ObjectId(user_id),
        username: `user${user_id.toString()}`,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: user_id,
        verify: UserVerifyStatus.Unverified,
        iat,
        exp
      })
    )
    return { access_token, refresh_token }
  }

  async login(payload: LoginReqBody) {
    const user = await databaseService.users.findOne({ email: payload.email, password: hashPassword(payload.password) })
    if (user === null) {
      throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
    }
    const user_id = user._id
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify: user.verify
    })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id,
        verify: user.verify,
        iat,
        exp
      })
    )
    return { access_token, refresh_token }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencode'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
    }
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)

    if (!userInfo.verified_email) {
      return new ErrorWithStatus({
        message: USER_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const user = await databaseService.users.findOne({ email: userInfo.email })

    if (user) {
      const user_id = user._id
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id,
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          token: refresh_token,
          user_id,
          verify: user.verify,
          iat,
          exp
        })
      )
      return { access_token, refresh_token, newUser: 0, verify: user.verify }
    } else {
      const password_ramdom = Math.random().toString(36).substring(2, 15)
      const date = new Date().toISOString()
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: date,
        password: password_ramdom,
        confirm_password: password_ramdom
      })
      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified }
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return USER_MESSAGES.LOGOUT_SUCCESS
  }

  async refreshToken(user_id: ObjectId, verify: UserVerifyStatus, old_refresh_token: string, exp: number) {
    const [token] = await Promise.all([
      await this.signAccessTokenAndRefreshToken({ user_id, verify, exp }),
      await databaseService.refreshTokens.deleteOne({ token: old_refresh_token })
    ])
    const [access_token, refresh_token] = token
    const { iat, exp: exp_new } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id,
        verify,
        iat,
        exp: exp_new
      })
    )
    return { access_token, refresh_token }
  }

  async verifyEmail(user_id: ObjectId) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({
        user_id,
        verify: UserVerifyStatus.Verified
      }),
      databaseService.users.updateOne(
        { _id: user_id },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: { updated_at: true }
        }
      )
    ])

    const [access_token, refresh_token] = token
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id,
        token: refresh_token,
        verify: UserVerifyStatus.Verified,
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: ObjectId) {
    const email_verify_token = await this.signVerifyEmailToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })

    const user = await databaseService.users.findOne({
      _id: user_id
    })

    // SEND EMAIL VERIFY
    try {
      await sendEmail(user?.email as string, email_verify_token)
    } catch (error) {
      throw new ErrorWithStatus({
        message: (error as any).message,
        status: (error as any).statusCode
      })
    }

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { email_verify_token },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USER_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }

  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    if (user === null) {
      throw new Error(USER_MESSAGES.USER_NOT_FOUND)
    }
    const user_id = user._id
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify: user.verify
    })

    // SEND EMAIL VERIFY
    try {
      await sendEmail(email as string, forgot_password_token, true)
    } catch (error) {
      throw new ErrorWithStatus({
        message: (error as any).message,
        status: (error as any).statusCode
      })
    }

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )

    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const { username } = payload

    const isUserName = await databaseService.users.findOne({
      username
    })

    if (isUserName) {
      throw new Error(USER_MESSAGES.USERNAME_EXISTED)
    }

    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload

    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: _payload as UpdateMeReqBody & { date_of_birth?: Date },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0
        }
      }
    )
    return user
  }

  async getProfile(username: string | string[]) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verify_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    return user
  }

  async followers(user_id: string, followed_user_id: string) {
    const follower_user = databaseService.users.findOne({
      user_id: new ObjectId(user_id)
    })

    if (follower_user === null) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (isFollowed) {
      return {
        message: USER_MESSAGES.FOLLOWED
      }
    }

    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )

    return {
      message: USER_MESSAGES.FOLLOW_SUCCESS
    }
  }

  async unFollowers(user_id: ObjectId, followed_user_id: string | string[]) {
    const follower_user = databaseService.users.findOne({
      user_id
    })

    if (follower_user === null) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id as string)
    })

    if (isFollowed === null) {
      return {
        message: USER_MESSAGES.ALREADY_UNFOLLOWED
      }
    }

    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id as string)
    })

    return {
      message: USER_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePassword(user_id: ObjectId, new_password: string) {
    await databaseService.users.updateOne(
      {
        _id: user_id
      },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
}

const userService = new UserService()
export default userService
