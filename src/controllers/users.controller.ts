import { Request, Response } from 'express'
import userService from '~/services/users.services'

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await userService.register({ email, password })
    res.json({ message: 'Register success!', result })
    return
  } catch (error) {
    res.status(400).json({ message: 'Email or password is required', error })
    return
  }
}

export const loginController = (req: Request, res: Response) => {
  res.json({
    message: 'login success'
  })
}
