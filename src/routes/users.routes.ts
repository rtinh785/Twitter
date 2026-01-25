import { Router } from 'express'

import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
