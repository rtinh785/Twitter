import { createHash } from 'crypto'
import { envConfig } from '~/constants/config'

const sha256 = (content: string) => {
  return createHash('sha256').update(content).digest('hex')
}

export const hashPassword = (password: string) => {
  return sha256(password + envConfig.hashPasswordSecret)
}
