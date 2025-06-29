import { NextFunction, Request, Response, Router } from 'express'
import { uploadConfig } from '../middlewares/upload-file'
import { container } from '../../../../ioc/container'
import validateToken from '../middlewares/validate-token'

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
    }
  }
}

const videoRouter = Router()

// Stryker disable all
videoRouter.use(validateToken)

videoRouter.post(
    '/upload', 
    uploadConfig.single('video'), 
    async (req: Request, res: Response, next: NextFunction) => {
        const { originalname, key, mimetype } = req.file as Express.MulterS3.File
        const { id, email } = req.user!

        try {
            if (!req.file) {
                res.status(400).json({ statusCode: 400, message: 'Missing file' })
                return
            }

            const response = await container.uploadVideoUseCase.execute({
                originalVideoName: originalname,
                savedVideoKey: key,
                mimeType: mimetype,
                user: {
                    id,
                    email
                }
            })

            res.status(202)
                .location(`/videos/${response.videoId}`)
                .json(response)
        } catch (error) {
            next(error)
        }
    })

videoRouter.get(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params

        try {
            const response = await container.findVideoByIdUseCase.execute({ id })
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
)

videoRouter.get(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        const customerId = req.user!.id

        try {
            const response = await container.findAllVideoUseCase.execute({ query: { customerId } })
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
)

videoRouter.patch(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params
        const { status, savedZipKey } = req.body

        try {
            const response = await container.updateVideoMetadataUseCase.execute({ id, status, savedZipKey })
            res.status(200).json(response)
        } catch (error) {
            next(error)
        }
    }
)

export default videoRouter
