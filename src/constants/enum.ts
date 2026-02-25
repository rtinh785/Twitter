export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccesToken,
  RefreshToken,
  ForgotPasswordToken,
  verifyEmailToken
}

export enum MediaType {
  Image,
  Video
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}

export enum People_follow {
  All = 'false',
  Following = 'true'
}
