import { WithId } from 'mongodb'
import { TokenPayload } from './models/request/User.request'
import Tweet from './models/schemas/Tweet.schema'
import { User } from './models/schemas/User.schema'
declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
    decode_email_verify_token?: TokenPayload
    decode_forgot_password_token?: TokenPayload
    tweet?: WithId<Tweet>
  }
}
