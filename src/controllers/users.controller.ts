import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/request/User.request'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerController = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await userService.register(req.body)
    res.json({ message: 'Register success!', result })
    return
  } catch (error) {
    next(error)
  }
}

export const loginController = (req: Request, res: Response) => {
  res.json({
    message: 'login success'
  })
}
