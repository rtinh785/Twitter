import { Router } from 'express'
import { likeController, unLikeController } from '~/controllers/like.controller'
import { tweetIdValidator } from '~/middlewares/tweet.middleware'

import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const likeRouter = Router()

likeRouter.post('', accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(likeController))
likeRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeController)
)

export default likeRouter
