import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { Request } from 'express'
import { envConfig } from '~/constants/config'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}

export const verifyAccessToken = async (accestoken: string, req?: Request) => {
  if (!accestoken) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decode_authorization = await verifyToken({
      token: accestoken,
      secretKey: envConfig.jwtSecretAccessToken
    })
    if (req) {
      ;(req as Request).decode_authorization = decode_authorization
      return true
    }
    return decode_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_INVALID,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
