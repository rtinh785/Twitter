import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ConversationReqParam } from '~/models/request/Conversation.request'
import { Pagination } from '~/models/request/Tweet.request'
import { TokenPayload } from '~/models/request/User.request'
import { conversationService } from '~/services/conversation.services'

export const getConversationController = async (
  req: Request<ConversationReqParam, any, any, Pagination>,
  res: Response
) => {
  const { receiver_id } = req.params
  const { limit, page } = req.query
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await conversationService.getConversation(
    new ObjectId(receiver_id),
    new ObjectId(user_id),
    Number(limit),
    Number(page)
  )

  res.json({ message: 'Get conversation successfully', result })
  return
}
