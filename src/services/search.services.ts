import { SearchQuery } from '~/models/request/Search.request'
import databaseService from './database.services'
import { MediaTypeQuery, TweetType } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { USER_MESSAGES } from '~/constants/messages'

class SearchService {
  async search(query: SearchQuery, user_id?: ObjectId) {
    const limit = Number(query.limit) || 10
    const page = Number(query.page) || 1
    const { people_follow } = query

    const match: any = {
      $text: {
        $search: query.content
      },
      ...(query.media_type && {
        'medias.type': query.media_type === MediaTypeQuery.Image ? 0 : 1
      })
    }

    if (people_follow === 'true') {
      if (!user_id) {
        throw new ErrorWithStatus({ message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: 402 })
      }
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
      ids.push(user_id as ObjectId)

      match['user_id'] = {
        $in: ids
      }
    }

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: match
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
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: match
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
        $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet) => {
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }

      tweet.updated_at = date
    })

    return { tweets, total: total[0]?.total || 0 }
  }
}

const searchService = new SearchService()
export default searchService
