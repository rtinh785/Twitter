import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { SearchQuery } from '~/models/request/Search.request'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const { content, limit, page, media_type, people_follow } = req.query
  const user_id = req.decode_authorization ? req.decode_authorization.user_id : undefined

  const result = await searchService.search(
    { content, limit, page, media_type, people_follow },
    user_id ? new ObjectId(user_id) : undefined
  )

  res.json({
    message: 'Get Search Successfully',
    result: result.tweets,
    limit,
    page,
    total_page: Math.ceil(result.total / Number(limit))
  })
  return
}
