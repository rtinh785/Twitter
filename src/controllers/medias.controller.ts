import { NextFunction, Request, Response } from 'express'
import path from 'node:path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { USER_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadImages(req)

  res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })
}

export const serverImageController = (req: Request<{ name: string }>, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not Found')
    }
  })
}

export const uploadVideosController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadVideos(req)

  res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })
}

export const serverVideoController = (req: Request<{ name: string }>, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_VIDEO_TEMP_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not Found')
    }
  })
}
