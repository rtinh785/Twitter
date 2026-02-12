import { ParamsDictionary } from 'express-serve-static-core'

export interface LikeRequestBody {
  tweet_id: string
}

export interface UnLikeReqParam extends ParamsDictionary {
  tweet_id: string
}
