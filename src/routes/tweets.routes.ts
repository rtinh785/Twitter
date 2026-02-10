import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controller'
import { tweetValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapRequestHandler(createTweetController)
)
export default tweetsRouter
