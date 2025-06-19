import { NextFunction, Request, Response, Router } from 'express'
import upload from '../config/multer-config'
import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'
import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'
import MySQLVideoMetadataRepository from '@adapter/driven/database/mysql-video-metadata-repository'
import { PrismaService } from '@adapter/driven/database/prisma/prisma.service'

const videoRouter = Router()

videoRouter.post(
  '/upload', 
  upload.single('video'), 
  async (req: Request, res: Response, next: NextFunction) => {
    const videoFile = req.file
    const customerId = req.header('x-customer-id')

    try {
      if (!videoFile) {
        res.status(400).json({ statusCode: 400, message: 'No video file uploaded' })
        return
      }
      if (!customerId) {
        res.status(400).json({ statusCode: 400, message: 'Missing x-customer-id header' })
        return
      }
      
      const uploadVideoUseCase = new UploadVideoUseCase(
        new S3VideoStorage(), 
        new MySQLVideoMetadataRepository(new PrismaService()), 
        new SqsMensageria()
      )

      const response = await uploadVideoUseCase.execute({
        filePath: videoFile.path,
        originalVideoName: videoFile.originalname,
        customerId: customerId as string
      })

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
})

export default videoRouter
