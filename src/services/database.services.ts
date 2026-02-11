import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { User } from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follow.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'

config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.unkk2wy.mongodb.net/?appName=Twitter`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
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
    return this.db.collection(process.env.DB_USERS_COLLECTION!)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION!)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION!)
  }

  get tweet(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION!)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAG_COLLECTION)
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
}

const databaseService = new DatabaseService()
export default databaseService
