import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapRequestHandler = <T>(func: RequestHandler<T>) => {
  return async (req: Request<T>, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next)
  }
}
