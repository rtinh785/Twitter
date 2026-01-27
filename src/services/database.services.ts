import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { User } from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

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
}

const databaseService = new DatabaseService()
export default databaseService
