import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'

interface TweetContructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
  constructor(TweetType: TweetContructor) {
    const date = new Date()
    this._id = TweetType._id
    this.user_id = TweetType.user_id
    this.type = TweetType.type
    this.audience = TweetType.audience
    this.content = TweetType.content
    this.parent_id = TweetType.parent_id ? new ObjectId(TweetType.parent_id) : null
    this.hashtags = TweetType.hashtags
    this.mentions = TweetType.mentions.map((item) => new ObjectId(item))
    this.medias = TweetType.medias
    this.guest_views = TweetType.guest_views || 0
    this.user_views = TweetType.user_views || 0
    this.created_at = TweetType.created_at || date
    this.updated_at = TweetType.updated_at || date
  }
}
