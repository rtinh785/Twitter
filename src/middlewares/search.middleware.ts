import { checkSchema } from 'express-validator'
import { MediaTypeQuery, People_follow } from '~/constants/enum'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: true,
        errorMessage: 'Content must be string'
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        },
        errorMessage: `Media type must be one of ${Object.values(MediaTypeQuery).join(', ')}`
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(People_follow)]
        },
        errorMessage: 'people_follow must be true or false'
      }
    },
    ['query']
  )
)

export default searchValidator
