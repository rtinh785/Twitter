import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { TweetIdReqParam, TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import tweetService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await tweetService.creaTweet(req.body, new ObjectId(user_id))
  res.json({ message: 'Create Tweet successfully', result })
  return
}

export const getTweetDetailController = async (req: Request<TweetIdReqParam>, res: Response) => {
  res.json({ message: 'Get Tweet Detail successfully' })
  return
}
