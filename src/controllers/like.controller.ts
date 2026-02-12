import { LikeRequestBody, UnLikeReqParam } from '~/models/request/Like.request'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '~/models/request/User.request'
import likeService from '~/services/like.services'
import { LIKE_MESSAGES } from '~/constants/messages'

export const likeController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await likeService.likeTweet(new ObjectId(user_id), new ObjectId(req.body.tweet_id))
  res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    result
  })
  return
}

export const unLikeController = async (req: Request<UnLikeReqParam>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.params

  const result = await likeService.unLikemarkTweet(new ObjectId(user_id), new ObjectId(tweet_id))
  res.json({
    message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY,
    result
  })
  return
}
