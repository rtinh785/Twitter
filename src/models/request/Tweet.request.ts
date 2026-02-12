import { TweetType, TweetAudience } from '~/constants/enum'
import { Media } from '../Other'
import { ParamsDictionary } from 'express-serve-static-core'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}

export interface TweetIdReqParam extends ParamsDictionary {
  tweet_id: string
}
