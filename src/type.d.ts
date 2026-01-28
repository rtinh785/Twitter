import { TokenPayload } from './models/request/User.request'
import { User } from './models/schemas/User.schema'
declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
  }
}
