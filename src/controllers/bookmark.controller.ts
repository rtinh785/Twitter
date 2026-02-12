import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { BookmarkTweetRequestBody, UnBookmarkReqParam } from '~/models/request/Bookmark.request'
import { TokenPayload } from '~/models/request/User.request'
import bookmarkService from '~/services/bookmark.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(new ObjectId(user_id), new ObjectId(req.body.tweet_id))
  res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
    result
  })
  return
}

export const unBookmarkTweetController = async (req: Request<UnBookmarkReqParam>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await bookmarkService.unBookmarkTweet(new ObjectId(user_id), new ObjectId(tweet_id))
  res.json({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY,
    result
  })
  return
}
