import path from 'path'
import multer from 'multer'
import { Request } from 'express'
import { v4 as uuidv4 }  from 'uuid'
import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(process.cwd(), 'tmp', 'uploads'))
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, uuidv4() + ext)
  },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true)
  } else {
    cb(new InvalidFileTypeException('Invalid video file type'))
  }
}

const uploadConfig = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter
})

export { uploadConfig, storage, fileFilter }
