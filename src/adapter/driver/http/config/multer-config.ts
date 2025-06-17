import multer from 'multer'
import path from 'path'
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

const upload = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new InvalidFileTypeException('Invalid video file type'))
    }
  }
})

export default upload
