import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/request/Search.request'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const { content, limit, page } = req.query
  const user_id = req.decode_authorization ? req.decode_authorization.user_id : undefined
  const result = await searchService.search({ content, limit, page }, user_id)
  res.json({ message: 'searchController successfully', result })
  return
}
