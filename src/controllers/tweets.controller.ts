import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId, WithId } from 'mongodb'
import { TweetType } from '~/constants/enum'
import { Pagination, TweetIdReqParam, TweetQueryType, TweetRequestBody } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import Tweet from '~/models/schemas/Tweet.schema'

import tweetService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await tweetService.creaTweet(req.body, new ObjectId(user_id))
  res.json({ message: 'Create Tweet successfully', result })
  return
}

export const getTweetDetailController = async (req: Request<TweetIdReqParam>, res: Response) => {
  const { tweet } = req

  const inc = await tweetService.increaseView(
    (tweet as WithId<Tweet>)._id,
    req.decode_authorization ? new ObjectId(req.decode_authorization._id) : undefined
  )
  const result = {
    ...tweet,
    user_views: inc.user_views,
    guest_views: inc.guest_views,
    updated_at: inc.updated_at
  }
  res.json({ message: 'Get Tweet Detail successfully', result })
  return
}

export const getTweetChildrenController = async (
  req: Request<TweetIdReqParam, any, any, TweetQueryType>,
  res: Response
) => {
  const { tweet_id } = req.params
  const { tweet_type, limit, page } = req.query
  const limitNumber = Number(limit)
  const pageNumber = Number(page)
  const tweetTypeNumber = Number(tweet_type) as TweetType

  const { user_id } = req.decode_authorization ? (req.decode_authorization as TokenPayload) : {}

  const { total, tweets } = await tweetService.getTweetChildren({
    tweet_id,
    tweet_type: tweetTypeNumber,
    limit: limitNumber,
    page: pageNumber,
    user_id
  })
  res.json({
    message: 'Get Tweet Children successfully',
    result: { tweets, tweet_type, limit, page, total_page: Math.ceil(total / limitNumber) }
  })
  return
}

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const result = await tweetService.getNewFeeds({
    user_id: new ObjectId(user_id),
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    message: 'Get New Feeds Successfully',
    result: result.tweets,
    limit,
    page,
    total_page: Math.ceil(result.total / Number(limit))
  })
  return
}
