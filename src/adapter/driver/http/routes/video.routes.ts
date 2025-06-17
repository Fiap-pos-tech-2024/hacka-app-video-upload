import { NextFunction, Request, Response, Router } from 'express'
import upload from '../config/multer-config'
import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import S3VideoRepository from '@adapter/driven/aws/s3-video-repository'
import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'

const videoRouter = Router()

videoRouter.post(
  '/upload', 
  upload.single('video'), 
  async (req: Request, res: Response, next: NextFunction) => {
    const videoFile = req.file

    try {
      if (!videoFile) {
        res.status(400).json({ statusCode: 400, message: 'No video file uploaded' })
        return
      }
      
      const uploadVideoUseCase = new UploadVideoUseCase(
        new S3VideoRepository(), new SqsMensageria()
      )
      const response = await uploadVideoUseCase.execute({
        filePath: videoFile.path,
        originalName: videoFile.originalname
      })

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
})

export default videoRouter
