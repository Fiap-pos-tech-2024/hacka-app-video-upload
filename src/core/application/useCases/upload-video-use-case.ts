import { VideoFile } from '@core/domain/entities/video-file'
import { IVideoStorage } from '../ports/video-storage'
import { getFileSize, getFileType, removeFile } from '@core/application/utils/file-utils'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { InvalidFileException } from '@core/domain/exceptions/file-exceptions'
import { IMensageria } from '../ports/mensageria'
import { IVideoMetadataRepository } from '../ports/video-metadata-repository'

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
        { filePath, originalName, email }: { filePath: string, originalName: string, email: string }
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
                originalName,
                filePath,
                size: fileSize,
                type: fileType,
            })

            await this.videoStorage.saveVideo(file)
            videoSaved = true

            await this.videoMetadataRepository.saveVideo({
                id: file.getId(),
                originalName: file.originalName,
                savedName: file.savedName,
                customerEmail: email,
                status: file.status
            })
            metadataSaved = true

            console.log(`Video file saved: ${file.savedName}`)

            await this.mensageria.sendMessage(this.queueUrl, {
                fileName: file.savedName,
                originalName: file.originalName,
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
                await this.videoStorage.deleteVideo(file.savedName)
            }
            removeFile(filePath)
            throw error
        }
    }
}
