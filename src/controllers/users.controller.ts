import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody
} from '~/models/request/User.request'
import { USER_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enum'

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

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decode_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    return res.status(404).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }

  if (user.email_verify_token === '') {
    res.json({ message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
    return
  }

  const result = await userService.verifyEmail(user_id)
  res.json({ message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS, result })
  return
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    res.json({ message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
    return
  }

  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { email } = req.body
  const result = await userService.forgotPassword(email)
  res.json({ message: result })
  return
}
