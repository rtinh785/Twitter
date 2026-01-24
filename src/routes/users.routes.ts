import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middleware'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, registerController)
usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
