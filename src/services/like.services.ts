import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { Like } from '~/models/schemas/Like.schema'

class LikeService {
  async likeTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const result = await databaseService.like.findOneAndUpdate(
      { user_id, tweet_id },
      {
        $setOnInsert: new Like({
          user_id,
          tweet_id
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }
  async unLikemarkTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const result = await databaseService.like.findOneAndDelete({ user_id, tweet_id })
    return result
  }
}

const likeService = new LikeService()
export default likeService
