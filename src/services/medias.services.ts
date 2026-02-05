import { Request } from 'express'
import path from 'node:path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadImages, handleUploadVideos } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
config()
class MediasService {
  async handleUploadImages(req: Request) {
    const files = await handleUploadImages(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${newName}.jpg`
            : `http://localhost:4000/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async handleUploadVideos(req: Request) {
    const files = await handleUploadVideos(req)
    const file = files[0]

    const newName = file.newFilename

    // const newPath = path.resolve(UPLOAD_VIDEO_DIR, `${newName}.jpg`)
    // await sharp(file.filepath).jpeg().toFile(newPath)
    // fs.unlinkSync(file.filepath)
    return {
      url: isProduction
        ? `${process.env.HOST}/static/${newName}`
        : `http://localhost:4000/static/video-streaming/${newName}`,
      type: MediaType.Video
    }
  }
}

const mediasService = new MediasService()
export default mediasService
