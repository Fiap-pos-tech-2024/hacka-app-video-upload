import path from 'path'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { v4 as uuidv4 } from 'uuid'
import { S3_CLIENT, BUCKET_NAME } from '@adapter/driven/aws/config/s3-configs'
import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true)
  } else {
    cb(new InvalidFileTypeException('Invalid video file type'))
  }
}

const uploadConfig = multer({
  storage: multerS3({
    s3: S3_CLIENT,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, `videos/${uuidv4() + ext}`)
    },
  }),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter,
})

export { uploadConfig, fileFilter }
