import { User } from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody } from '~/models/request/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USER_MESSAGES } from '~/constants/messages'

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccesToken
      },
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
      options: {
        expiresIn: Number(process.env.RERESH_TOKEN_EXPRIRES_IN)
      }
    })
  }

  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: await this.signRefreshToken(user_id),
        user_id
      })
    )

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
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

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
}

const userService = new UserService()
export default userService
