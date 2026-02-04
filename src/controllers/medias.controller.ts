import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import mime from 'mime'
import path from 'node:path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
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
  const url = await mediasService.handleUploadVideos(req)

  res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

// export const serverVideoStreamController = (req: Request<{ name: string }>, res: Response, next: NextFunction) => {
//   try {
//     const range = req.headers.range
//     if (!range) {
//       return res.status(400).send('Requires Range header')
//     }

//     const { name } = req.params
//     const videoPath = path.resolve(UPLOAD_VIDEO_TEMP_DIR, name)

//     const videoSize = fs.statSync(videoPath).size

//     // Parse range: "bytes=start-end"
//     const parts = range.replace(/bytes=/, '').split('-')
//     const start = parseInt(parts[0], 10)
//     const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1

//     if (start >= videoSize) {
//       return res.status(416).send('Requested range not satisfiable')
//     }

//     const contentLength = end - start + 1
//     const contentType = mime.getType(videoPath) || 'video/mp4'

//     res.writeHead(206, {
//       'Content-Range': `bytes ${start}-${end}/${videoSize}`,
//       'Accept-Ranges': 'bytes',
//       'Content-Length': contentLength,
//       'Content-Type': contentType
//     })

//     const stream = fs.createReadStream(videoPath, { start, end })
//     stream.pipe(res)
//   } catch (err) {
//     next(err)
//   }
// }

export const serverVideoStreamController = (req: Request<{ name: string }>, res: Response, next: NextFunction) => {
  const { name } = req.params

  res.sendFile(path.resolve(UPLOAD_VIDEO_TEMP_DIR, name), (err) => {
    if (err) {
      console.error(err)
      if (!res.headersSent) {
        res.sendStatus(404)
      }
    }
  })
}
