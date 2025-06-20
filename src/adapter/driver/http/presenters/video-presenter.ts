import { VideoFile } from '@core/domain/entities/video-file'

export class VideoPresenter {
    private readonly originalVideoName: string
    private readonly savedVideoKey: string
    private readonly mimeType: string

    constructor(originalVideoName: string, savedVideoKey: string, mimeType: string) {
        this.originalVideoName = originalVideoName
        this.savedVideoKey = savedVideoKey
        this.mimeType = mimeType
    }

    static fromDomain(videoFile: VideoFile): VideoPresenter {
        return new VideoPresenter(
            videoFile.originalVideoName,
            videoFile.savedVideoKey,
            videoFile.mimeType
        )
    }
}