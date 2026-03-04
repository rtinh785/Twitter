import { Router } from 'express'
import { getConversationController } from '~/controllers/conversation.controller'

import { paginationValidator } from '~/middlewares/tweet.middleware'

import { accessTokenValidator, conversationValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationRouter = Router()
conversationRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  conversationValidator,
  wrapRequestHandler(getConversationController)
)

export default conversationRouter
