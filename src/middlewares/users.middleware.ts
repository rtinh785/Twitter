import { Request, Response, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ErrorWithStatus } from '~/models/Errors'
import { RegisterReqBody } from '~/models/request/User.request'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema({
    name: {
      isString: true,
      notEmpty: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await userService.checkEmailExist(value)
          if (isExistEmail) throw new ErrorWithStatus({ message: 'Email alreday exist!', status: 401 })
          return true
        }
      }
    },
    password: {
      isString: true,
      notEmpty: true,
      isLength: {
        options: {
          min: 6,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: 'isStrongPassword'
      }
    },
    confirm_password: {
      isString: true,
      notEmpty: true,
      isLength: {
        options: {
          min: 6,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: 'isStrongPassword'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirm does not  match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      notEmpty: true,
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  } as Record<keyof RegisterReqBody, ParamSchema>)
)

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}
