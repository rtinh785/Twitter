import { Router } from 'express'
import { searchController } from '~/controllers/search.controller'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const searchRouter = Router()

searchRouter.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(searchController)
)

export default searchRouter
