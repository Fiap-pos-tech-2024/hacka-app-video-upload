import { NextFunction, Request, Response, Router } from 'express'
import upload from '../config/multer-config'
import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'
import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'
import MySQLVideoMetadataRepository from '@adapter/driven/aws/database/mysql-video-metadata-repository'
import { PrismaService } from '@adapter/driven/aws/database/prisma/prisma.service'

const videoRouter = Router()

videoRouter.post(
  '/upload', 
  upload.single('video'), 
  async (req: Request, res: Response, next: NextFunction) => {
    const videoFile = req.file
    const userEmail = req.header('x-user-email')

    try {
      if (!videoFile) {
        res.status(400).json({ statusCode: 400, message: 'No video file uploaded' })
        return
      }
      if (!userEmail) {
        res.status(400).json({ statusCode: 400, message: 'Missing x-user-email header' })
        return
      }
      
      const uploadVideoUseCase = new UploadVideoUseCase(
        new S3VideoStorage(), 
        new MySQLVideoMetadataRepository(new PrismaService()), 
        new SqsMensageria()
      )

      const response = await uploadVideoUseCase.execute({
        filePath: videoFile.path,
        originalName: videoFile.originalname,
        email: userEmail as string
      })

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
})

export default videoRouter
