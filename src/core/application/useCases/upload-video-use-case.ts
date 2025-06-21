import { VideoFile } from '@core/domain/entities/video-file'
import { IVideoStorage } from '../ports/video-storage'
import { IMensageria } from '../ports/mensageria'
import { IVideoMetadataRepository } from '../ports/video-metadata-repository'
import { AsyncUploadPresenter } from '@adapter/driver/http/presenters/async-upload-presenter'
import { ICache } from '../ports/cache'

interface UploadVideoUseCaseDto {
    originalVideoName: string
    savedVideoKey: string
    mimeType: string
    customerId: string
}

export class UploadVideoUseCase {
    private readonly queueUrl: string

    constructor(
        private readonly videoStorage: IVideoStorage,
        private readonly videoMetadataRepository: IVideoMetadataRepository,
        private readonly mensageria: IMensageria,
        private readonly cache: ICache
    )   {
        this.queueUrl = process.env.UPLOADED_VIDEO_QUEUE_URL ?? ''
    }

    async execute(
        { originalVideoName, savedVideoKey, mimeType, customerId }: UploadVideoUseCaseDto
    ): Promise<AsyncUploadPresenter> {
        let file: VideoFile | undefined
        let metadataSaved = false

        try {
            file = new VideoFile({ originalVideoName, savedVideoKey, mimeType })
            
            await this.videoMetadataRepository.saveVideo({
                id: file.getId(),
                originalVideoName: file.originalVideoName,
                savedVideoKey: file.savedVideoKey,
                customerId,
                status: file.status
            })
            metadataSaved = true

            console.info(`Video file saved: ${file.savedVideoKey}`)

            await this.mensageria.sendMessage(this.queueUrl, {
                registerId: file.getId(),
                savedVideoKey: file.savedVideoKey,
                originalVideoName: file.originalVideoName,
                type: file.mimeType,
            })
            
            console.info(`Message sent to SQS queue: ${this.queueUrl}`)
            
            await this.cache.del(`videos:customer:${customerId}`)

            return AsyncUploadPresenter.fromDomain(file)
        } catch (error) {
            // Compensação para garantir atomicidade
            if (file && metadataSaved) {
                await this.videoMetadataRepository.deleteVideoById(file.getId())
            }
            await this.videoStorage.deleteVideo(savedVideoKey)
            
            throw error
        }
    }
}
