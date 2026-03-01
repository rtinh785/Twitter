import { Request } from 'express'
import { getNameFromFullName, handleUploadImages, handleUploadVideos } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import supabase from '~/services/supabase.services'

config()
class MediasService {
  async handleUploadImages(req: Request) {
    const files = await handleUploadImages(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const filePath = file.filepath

        const fileBuffer = fs.readFileSync(filePath)

        const { data, error } = await supabase.storage.from('images').upload(`${newName}.jpg`, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        })

        if (error) {
          throw error
        }

        const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(`${newName}.jpg`)

        fs.unlinkSync(filePath)

        return {
          url: publicUrl.publicUrl,
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
    const filePath = file.filepath

    const fileBuffer = fs.readFileSync(filePath)

    const { error } = await supabase.storage.from('videos').upload(newName, fileBuffer, {
      contentType: 'video/mp4',
      upsert: false
    })

    if (error) {
      throw error
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(newName)

    fs.unlinkSync(filePath)

    return {
      url: data.publicUrl,
      type: MediaType.Video
    }
  }
}

const mediasService = new MediasService()
export default mediasService
