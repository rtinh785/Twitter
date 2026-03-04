import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationService {
  async getConversation(receiver_id: ObjectId, user_id: ObjectId, limit: number, page: number) {
    const match = {
      $or: [
        { sender_id: user_id, receiver_id },
        { sender_id: receiver_id, receiver_id: user_id }
      ]
    }

    const conversation = await databaseService.conversations
      .find(match)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await databaseService.conversations.countDocuments(match)

    return { limit, page, total_pages: Math.ceil(total / Number(limit)), conversation }
  }
}

export const conversationService = new ConversationService()
