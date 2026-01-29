import { User } from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody } from '~/models/request/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USER_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccesToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPRIRES_IN)
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: Number(process.env.RERESH_TOKEN_EXPRIRES_IN)
      }
    })
  }

  private signverifyEmailToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.verifyEmailToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_TOKEN as string,
      options: {
        expiresIn: Number(process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN)
      }
    })
  }

  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
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
    const email_verify_token = await this.signverifyEmailToken(user_id.toString())
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: new ObjectId(user_id),
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: await this.signRefreshToken(user_id.toString()),
        user_id: user_id.toString()
      })
    )

    console.log(`Email verify token: ${email_verify_token}`)
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())
    return { access_token, refresh_token }
  }

  async login(payload: LoginReqBody) {
    const user = await databaseService.users.findOne({ email: payload.email, password: hashPassword(payload.password) })
    if (user === null) {
      throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
    }
    const user_id = user._id.toString()
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: await this.signRefreshToken(user_id),
        user_id
      })
    )
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user._id.toString())
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return USER_MESSAGES.LOGOUT_SUCCESS
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
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
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signverifyEmailToken(user_id)
    console.log(`Resend email verify token:`, email_verify_token)
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
    const forgot_password_token = await this.signForgotPasswordToken(user_id.toString())

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )

    console.log(`Forgot password token:`, forgot_password_token)

    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
}

const userService = new UserService()
export default userService
