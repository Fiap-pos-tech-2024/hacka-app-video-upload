import { VideoFile } from '@core/domain/entities/video-file'
import { IVideoStorage } from '../ports/video-storage'
import { IMensageria } from '../ports/mensageria'
import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { AsyncUploadPresenter } from '@adapter/driver/http/presenters/async-upload-presenter'
import { ICache } from '../ports/cache'
import { SQSServiceException } from '@aws-sdk/client-sqs'

interface UploadVideoUseCaseDto {
    originalVideoName: string
    savedVideoKey: string
    mimeType: string
    user: {
        id: string
        email: string,
        authorization: string
    }
}

export class UploadVideoUseCase {
    private readonly queueUrl: string

    constructor(
        private readonly videoStorage: IVideoStorage,
        private readonly videoMetadataRepository: IVideoMetadataRepository,
        private readonly mensageria: IMensageria,
        private readonly cache: ICache
    )   {
        this.queueUrl = process.env.VIDEO_PROCESSING_QUEUE_URL ?? ''
    }

    async execute(
        { originalVideoName, savedVideoKey, mimeType, user }: UploadVideoUseCaseDto
    ): Promise<AsyncUploadPresenter> {
        let file: VideoFile | undefined

        try {
            file = new VideoFile({ originalVideoName, savedVideoKey, mimeType })
            
            await this.videoMetadataRepository.saveVideo({
                id: file.getId(),
                originalVideoName: file.originalVideoName,
                savedVideoKey: file.savedVideoKey,
                customerId: user.id,
                status: file.status
            })

            console.info(`Video file saved: ${file.savedVideoKey}`)

            await this.mensageria.sendMessage(this.queueUrl, {
                registerId: file.getId(),
                savedVideoKey: file.savedVideoKey,
                originalVideoName: file.originalVideoName,
                type: file.mimeType,
                user
            })
            
            console.info(`Message sent to SQS queue: ${this.queueUrl}`)

            await this.cache.del(`videos:customer:${user.id}`)

            return AsyncUploadPresenter.fromDomain(file)
        } catch (error) {
            // Compensação para garantir atomicidade
            if (error instanceof SQSServiceException && file) {
                await this.videoMetadataRepository.deleteVideoById(file.getId())
            }
            await this.videoStorage.deleteVideo(savedVideoKey)
            
            throw error
        }
    }
}
