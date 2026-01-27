import jwt, { SignOptions } from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | object | Buffer<ArrayBufferLike>
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error || !token) {
        return reject(error)
      }
      resolve(token)
    })
  })
}

export const verifyToken = ({
  token,
  secretKey = process.env.JWT_SECRET as string
}: {
  token: string
  secretKey?: string
}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error || !decoded) {
        return reject(error)
      }
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
