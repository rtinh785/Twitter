import { Router } from 'express'

import { loginController, registerController } from '~/controllers/users.controller'
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post(
  '/logout',
  accessTokenValidator,
  wrapRequestHandler(async (req, res) => {
    res.status(200).json({ message: 'Logout successful' })
  })
)

export default usersRouter
