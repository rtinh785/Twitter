import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: string
  token: string
  user_id: ObjectId
  created_at?: Date
}

export default class RefreshToken {
  _id?: string
  token: string
  user_id: ObjectId
  created_at: Date

  constructor(refreshToken: RefreshTokenType) {
    const date = new Date()
    this._id = refreshToken._id
    this.token = refreshToken.token
    this.user_id = refreshToken.user_id
    this.created_at = refreshToken.created_at || date
  }
}
