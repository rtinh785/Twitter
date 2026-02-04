import { Request } from 'express'
import fs from 'fs'
import formidable, { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (filename: string) => {
  const arr = filename.split('.')
  return arr[arr.length - 1]
}

export const handleUploadImages = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024, //300KB
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, mimetype }) {
      const isValid = name === 'images' && Boolean(mimetype?.includes('image/'))
      if (!isValid) {
        form.emit('err' as any, new Error('File type is not valid') as any)
      }
      return isValid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.images) {
        return reject(new Error('File is empty'))
      }
      resolve(files.images)
    })
  })
}

export const handleUploadVideos = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_TEMP_DIR,
    maxFiles: 1,
    maxFieldsSize: 80 * 1024 * 1024,
    filter: function ({ name, mimetype }) {
      const isValid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!isValid) {
        form.emit('err' as any, new Error('File type is not valid') as any)
      }
      return isValid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.video) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video
      videos.forEach((video) => {
        const ex = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ex)
        video.newFilename = video.newFilename + '.' + ex
      })

      resolve(files.video)
    })
  })
}
