import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocuments.map((hashtagName) => (hashtagName as WithId<Hashtag>)._id)
  }

  async creaTweet(body: TweetRequestBody, user_id: ObjectId) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)
    const result = await databaseService.tweet.insertOne(
      new Tweet({
        user_id: user_id,
        type: body.type,
        content: body.content,
        audience: body.audience,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id
      })
    )
    const tweet = await databaseService.tweet.findOne({ _id: result.insertedId })
    return tweet
  }
}

const tweetService = new TweetService()
export default tweetService
