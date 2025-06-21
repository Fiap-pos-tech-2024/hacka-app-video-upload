import { NextFunction, Request, Response, Router } from 'express'
import { uploadConfig } from '../config/multer-config'
import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import S3VideoStorage from '@adapter/driven/aws/s3-video-storage'
import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'
import MySqlVideoMetadataRepository from '@adapter/driven/database/mysql-video-metadata-repository'
import { PrismaService } from '@adapter/driven/database/prisma/prisma.service'
import { UpdateVideoMetadataUseCase } from '@core/application/useCases/update-video-metadata-use-case'

const videoRouter = Router()

const prismaService = new PrismaService()
const mySqlVideoMetadataRepository = new MySqlVideoMetadataRepository(prismaService)
const s3VideoStorage = new S3VideoStorage()
const sqsMensageria = new SqsMensageria()

// Stryker disable all
videoRouter.post(
  '/upload', 
  uploadConfig.single('video'), 
  async (req: Request, res: Response, next: NextFunction) => {
    const { originalname, key, mimetype } = req.file as Express.MulterS3.File
    const customerId = req.header('x-customer-id')

    try {
      if (!req.file || !customerId) {
        res.status(400).json({ statusCode: 400, message: 'Missing requireds fields' })
        return
      }
      
      const uploadVideoUseCase = new UploadVideoUseCase(
        s3VideoStorage, 
        mySqlVideoMetadataRepository, 
        sqsMensageria
      )

      const response = await uploadVideoUseCase.execute({
        originalVideoName: originalname,
        savedVideoKey: key,
        mimeType: mimetype,
        customerId: customerId as string
      })

      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
})

videoRouter.patch(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { status, savedZipKey } = req.body
    
    try {
      const updateVideoMetadataUseCase = new UpdateVideoMetadataUseCase(
        mySqlVideoMetadataRepository
      )
      const response = await updateVideoMetadataUseCase.execute({ id, status, savedZipKey })
      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
)

export default videoRouter
