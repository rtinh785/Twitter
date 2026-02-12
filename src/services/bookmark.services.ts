import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Bookmark from '../models/schemas/Bookmark.schema'

class BookmarkService {
  async bookmarkTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const result = await databaseService.bookmark.findOneAndUpdate(
      { user_id, tweet_id },
      {
        $setOnInsert: new Bookmark({
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
  async unBookmarkTweet(user_id: ObjectId, tweet_id: ObjectId) {
    const result = await databaseService.bookmark.findOneAndDelete({ user_id, tweet_id })
    return result
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
