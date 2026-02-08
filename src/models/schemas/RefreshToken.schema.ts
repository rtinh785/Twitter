import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

interface RefreshTokenType {
  _id?: string
  token: string
  user_id: ObjectId
  verify: UserVerifyStatus
  created_at?: Date
  iat: number
  exp: number
}

export default class RefreshToken {
  _id?: string
  token: string
  user_id: ObjectId
  created_at: Date
  iat: Date
  exp: Date

  constructor(refreshToken: RefreshTokenType) {
    const date = new Date()
    this._id = refreshToken._id
    this.token = refreshToken.token
    this.user_id = refreshToken.user_id
    this.created_at = refreshToken.created_at || date
    this.iat = new Date(refreshToken.iat * 1000)
    this.exp = new Date(refreshToken.exp * 1000)
  }
}
