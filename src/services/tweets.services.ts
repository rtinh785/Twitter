import { TweetRequestBody } from '~/models/request/Tweet.request'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enum'

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
    const result = await databaseService.tweets.insertOne(
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
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  async increaseView(tweet_id: ObjectId, user_id?: ObjectId) {
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: tweet_id
      },
      {
        $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    )
    return result as WithId<{
      user_views: number
      guest_views: number
      updated_at: Date
    }>
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $project: {
            'mentions.password': 0
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweets_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweets_children',
                  as: 'retweet',
                  cond: {
                    $eq: ['$$retweet.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweets_children',
                  as: 'retweet',
                  cond: {
                    $eq: ['$$retweet.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweets_children',
                  as: 'retweet',
                  cond: {
                    $eq: ['$$retweet.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()

    const [, total] = await Promise.all([
      await databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
          $set: {
            updated_at: date
          }
        }
      ),
      await databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return { tweets, total }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: ObjectId; limit: number; page: number }) {
    const followed_user_id = await databaseService.followers
      .find(
        {
          user_id
        },
        {
          projection: {
            _id: 0,
            followed_user_id: 1
          }
        }
      )
      .toArray()
    const ids = followed_user_id.map((follower) => follower.followed_user_id)
    ids.push(user_id)

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $project: {
              'mentions.password': 0
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweets_children'
            }
          },
          {
            $addFields: {
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweets_children',
                    as: 'retweet',
                    cond: {
                      $eq: ['$$retweet.type', TweetType.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweets_children',
                    as: 'retweet',
                    cond: {
                      $eq: ['$$retweet.type', TweetType.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweets_children',
                    as: 'retweet',
                    cond: {
                      $eq: ['$$retweet.type', TweetType.QuoteTweet]
                    }
                  }
                }
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },

          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()

    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet) => {
      tweet.user_views += 1
      tweet.updated_at = date
    })

    return {
      tweets,
      total: total[0].total
    }
  }
}

const tweetService = new TweetService()
export default tweetService
