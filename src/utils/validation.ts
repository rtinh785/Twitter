import { Request, Response, NextFunction } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const error = validationResult(req)

    if (error.isEmpty()) {
      return next()
    }

    const errorObjecct = error.mapped()
    const entityErrors = new EntityError({ errors: {} })

    for (const key in errorObjecct) {
      const { msg } = errorObjecct[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityErrors.errors[key] = errorObjecct[key]
    }

    next(entityErrors)
  }
}
