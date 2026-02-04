import { Router } from 'express'
import { serverImageController, serverVideoStreamController } from '~/controllers/medias.controller'

const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video-streaming/:name', serverVideoStreamController)

export default staticRouter
