import { config } from 'dotenv'
import argv from 'minimist'

const options = argv(process.argv.slice(2))

export const isProduction = Boolean(options.production)
config({ path: isProduction ? '.env.production' : '.env' })

export const envConfig = {
  port: (process.env.PORT || 3000) as number,

  host: process.env.HOST,

  dbName: process.env.DB_NAME,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,

  dbUsersCollection: process.env.DB_USERS_COLLECTION,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION,
  dbTweetCollection: process.env.DB_TWEET_COLLECTION,
  dbHashtagCollection: process.env.DB_HASHTAG_COLLECTION,
  dbBookmarkCollection: process.env.DB_BOOKMARK_COLLECTION,
  dbLikeCollection: process.env.DB_LIKE_COLLECTION,
  dbConversationCollection: process.env.DB_CONVERSATION_COLLECTION,

  hashPasswordSecret: process.env.HASH_PASSWORD_SECRET,

  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
  jwtSecretEmailToken: process.env.JWT_SECRET_EMAIL_TOKEN,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,

  resendApiKey: process.env.RESEND_API_KEY,
  urlClientHost: process.env.URL_CLIENT_HOST,

  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK,

  passwordDatabase: process.env.PASSWORD_DATABASE,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY
}
