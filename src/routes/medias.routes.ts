import { Router } from 'express'
import { uploadImagesController, uploadVideosController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',

  wrapRequestHandler(uploadImagesController)
)
mediasRouter.post(
  '/upload-video',

  wrapRequestHandler(uploadVideosController)
)

export default mediasRouter
