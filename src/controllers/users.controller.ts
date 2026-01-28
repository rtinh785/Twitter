import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '~/models/request/User.request'
import { USER_MESSAGES } from '~/constants/messages'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
  return
}

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await userService.login(req.body)
  res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
  return
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body

  const result = await userService.logout(refresh_token)
  res.json({ message: result })
  return
}
