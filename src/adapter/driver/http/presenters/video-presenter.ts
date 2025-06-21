import { VideoFile } from '@core/domain/entities/video-file'

export class VideoPresenter {
    private readonly id: string
    private readonly originalVideoName: string
    private readonly savedVideoKey: string
    private readonly status: string
    private readonly savedZipKey?: string | null
    private readonly customerId?: string
    private readonly createdAt?: Date | string
    private readonly updatedAt?: Date | string

    constructor(
        id: string,
        originalVideoName: string,
        savedVideoKey: string,
        status: string,
        customerId?: string,
        createdAt?: Date | string,
        updatedAt?: Date | string,
        savedZipKey?: string | null
    ) {
        this.id = id
        this.originalVideoName = originalVideoName
        this.savedVideoKey = savedVideoKey
        this.status = status
        this.customerId = customerId
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.savedZipKey = savedZipKey
    }

    static fromDomain(videoFile: VideoFile): VideoPresenter {
        return new VideoPresenter(
            videoFile.getId(),
            videoFile.originalVideoName,
            videoFile.savedVideoKey,
            videoFile.status,
            videoFile.customerId,
            videoFile.createdAt,
            videoFile.updatedAt,
            videoFile.savedZipKey
        )
    }
}