import { Router } from 'express'
import { uploadImagesController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImagesController))

export default mediasRouter
