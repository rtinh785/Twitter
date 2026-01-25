import jwt, { SignOptions } from 'jsonwebtoken'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
