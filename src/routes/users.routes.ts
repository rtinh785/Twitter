import { Router } from 'express'

import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  verifyEmailTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

export default usersRouter
