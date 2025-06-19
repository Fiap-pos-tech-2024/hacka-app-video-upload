import { VideoFile } from '@core/domain/entities/video-file'

export class VideoPresenter {
    private readonly originalVideoName: string
    private readonly savedVideoName: string
    private readonly size: number
    private readonly type: string

    constructor(originalVideoName: string, savedVideoName: string, size: number, type: string) {
        this.originalVideoName = originalVideoName
        this.savedVideoName = savedVideoName
        this.size = size
        this.type = type
    }

    static fromDomain(videoFile: VideoFile): VideoPresenter {
        return new VideoPresenter(
            videoFile.originalVideoName,
            videoFile.savedVideoName,
            videoFile.size,
            videoFile.type
        )
    }
}