import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'node:path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024 //300KB
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({ message: 'hhehehe' })
  })
}
