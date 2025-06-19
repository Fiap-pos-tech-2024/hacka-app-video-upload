import { VideoFile } from '@core/domain/entities/video-file'
import { IVideoStorage } from '../ports/video-storage'
import { getFileSize, getFileType, removeFile } from '@core/application/utils/file-utils'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { InvalidFileException } from '@core/domain/exceptions/file-exceptions'
import { IMensageria } from '../ports/mensageria'
import { IVideoMetadataRepository } from '../ports/video-metadata-repository'

interface UploadVideoUseCaseDto {
    filePath: string
    originalVideoName: string
    customerId: string
}

export class UploadVideoUseCase {
    private readonly queueUrl: string

    constructor(
        private readonly videoStorage: IVideoStorage,
        private readonly videoMetadataRepository: IVideoMetadataRepository,
        private readonly mensageria: IMensageria,
    ) {
            this.queueUrl = process.env.UPLOADED_VIDEO_QUEUE_URL ?? ''
        }

    async execute(
        { filePath, originalVideoName, customerId }: UploadVideoUseCaseDto
    ): Promise<VideoPresenter> {
        let file: VideoFile | undefined
        let videoSaved = false
        let metadataSaved = false

        try {
            const fileSize = getFileSize(filePath)
            const fileType = getFileType(filePath)

            if (fileSize === 0 || fileType === 'unknown') {
                throw new InvalidFileException('File is empty or does not exist.')
            }

            file = new VideoFile({
                originalVideoName,
                filePath,
                size: fileSize,
                type: fileType,
            })

            await this.videoStorage.saveVideo(file)
            videoSaved = true

            await this.videoMetadataRepository.saveVideo({
                id: file.getId(),
                originalVideoName: file.originalVideoName,
                savedVideoName: file.savedVideoName,
                customerId,
                status: file.status
            })
            metadataSaved = true

            console.log(`Video file saved: ${file.savedVideoName}`)

            await this.mensageria.sendMessage(this.queueUrl, {
                savedVideoName: file.savedVideoName,
                originalVideoName: file.originalVideoName,
                size: file.size,
                type: file.type,
            })
            
            console.log(`Message sent to SQS queue: ${this.queueUrl}`)
            
            return VideoPresenter.fromDomain(file)
        } catch (error) {
            // Compensação para garantir atomicidade
            if (file && metadataSaved) {
                await this.videoMetadataRepository.deleteVideoById(file.getId())
            }
            if (file && videoSaved) {
                await this.videoStorage.deleteVideo(file.savedVideoName)
            }
            removeFile(filePath)
            throw error
        }
    }
}
