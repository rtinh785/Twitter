import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { User } from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follow.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import { Like } from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversations'
import { envConfig } from '~/constants/config'

config()

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@twitter.unkk2wy.mongodb.net/?appName=Twitter`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (e) {
      console.log('Error', e)
      throw e
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection!)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection!)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection!)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetCollection!)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagCollection!)
  }

  get bookmark(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarkCollection!)
  }

  get like(): Collection<Like> {
    return this.db.collection(envConfig.dbLikeCollection!)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection!)
  }

  async indexUser() {
    if (!(await this.users.indexExists('email_1_password_1'))) {
      await this.users.createIndex({ email: 1, password: 1 })
    }

    if (!(await this.users.indexExists('email_1'))) {
      await this.users.createIndex({ email: 1 }, { unique: true })
    }

    if (!(await this.users.indexExists('username_1'))) {
      await this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexFollower() {
    if (!(await this.followers.indexExists('user_id_1_followed_user_id_1'))) {
      await this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  async indexRefreshToken() {
    if (!(await this.refreshTokens.indexExists('token_1'))) {
      await this.refreshTokens.createIndex({ token: 1 })
    }

    if (!(await this.refreshTokens.indexExists('exp_1'))) {
      await this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexTweets() {
    if (!(await this.tweets.indexExists('content_text'))) {
      await this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
