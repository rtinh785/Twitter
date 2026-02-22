import { SearchQuery } from '~/models/request/Search.request'
import databaseService from './database.services'
import { TweetType } from '~/constants/enum'
import { ObjectId } from 'mongodb'

class SearchService {
  async search(query: SearchQuery, user_id?: ObjectId) {
    const limit = Number(query.limit) || 10
    const page = Number(query.page) || 1
    const result = databaseService.tweets
      .aggregate([
        {
          $match: {
            $text: {
              $search: query.content
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
    return result
  }
}

const searchService = new SearchService()
export default searchService
