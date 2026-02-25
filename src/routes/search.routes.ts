import { Router } from 'express'
import { searchController } from '~/controllers/search.controller'
import searchValidator from '~/middlewares/search.middleware'
import { paginationValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const searchRouter = Router()

searchRouter.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  paginationValidator,
  searchValidator,
  wrapRequestHandler(searchController)
)

export default searchRouter
