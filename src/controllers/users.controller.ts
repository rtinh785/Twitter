import { Request, Response, NextFunction } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePassword,
  FollowReqBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshReqBody,
  RegisterReqBody,
  ResetPasswordValidator,
  TokenPayload,
  UnFollowReqParam,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/request/User.request'
import { USER_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { hashPassword } from '~/utils/crypto'
import { config } from 'dotenv'

config()

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

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = (await userService.oauth(code as string)) as {
    access_token: string
    refresh_token: string
    newUser: number
    verify: UserVerifyStatus
  }
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  res.redirect(urlRedirect)
  return
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body

  const result = await userService.logout(refresh_token)
  res.json({ message: result })
  return
}

export const refreshTokenController = async (req: Request<ParamsDictionary, any, RefreshReqBody>, res: Response) => {
  const { refresh_token: old_refresh_token } = req.body
  const { user_id, verify, exp } = req.decode_refresh_token as TokenPayload
  const result = await userService.refreshToken(new ObjectId(user_id), verify, old_refresh_token, exp)
  res.json({ result: result })
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

  const result = await userService.verifyEmail(new ObjectId(user_id))
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

  const result = await userService.resendVerifyEmail(new ObjectId(user_id))
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

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  res.json({ message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS })
  return
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordValidator>,
  res: Response
) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { new_password } = req.body
  const result = await userService.resetPassword(user_id, new_password)
  res.json({ message: result })
  return
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id, verify } = req.decode_authorization as TokenPayload
  console.log(verify)
  const user = await userService.getMe(user_id)
  res.json({ message: USER_MESSAGES.GET_ME_SUCCESS, result: user })
}

export const updateGetMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const body = req.body
  const user = await userService.updateMe(user_id, body)
  res.json({ message: USER_MESSAGES.UPDATE_ME_SUCCESS, user })
}

export const getProfileController = async (req: Request<{ username: string | string[] }>, res: Response) => {
  const { username } = req.params
  const user = await userService.getProfile(username)

  res.json({ message: USER_MESSAGES.GET_PROFILE_SUCCESS, result: user })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await userService.followers(user_id, followed_user_id)
  res.json({ result })
  return
}

export const unFollowController = async (req: Request<UnFollowReqParam>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { followed_user_id } = req.params
  const result = await userService.unFollowers(new ObjectId(user_id), followed_user_id)
  res.json({ result })
  return
}

export const changePasswordController = async (req: Request<ParamsDictionary, any, ChangePassword>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { old_password, password: new_password } = req.body
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }

  const { password } = user
  const isMatch = hashPassword(old_password) === password
  if (!isMatch) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.OLD_PASSWORD_NOT_MATCH,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  const result = await userService.changePassword(new ObjectId(user_id), new_password)

  res.json({ result })
  return
}
