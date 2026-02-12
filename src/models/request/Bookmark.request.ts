import { ParamsDictionary } from 'express-serve-static-core'

export interface BookmarkTweetRequestBody {
  tweet_id: string
}

export interface UnBookmarkReqParam extends ParamsDictionary {
  tweet_id: string
}
