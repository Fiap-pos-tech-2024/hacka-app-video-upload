import { VideoFile } from '@core/domain/entities/video-file'

export class VideoPresenter {
    private readonly originalName: string
    private readonly savedName: string
    private readonly size: number
    private readonly type: string

    constructor(originalName: string, savedName: string, size: number, type: string) {
        this.originalName = originalName
        this.savedName = savedName
        this.size = size
        this.type = type
    }

    static fromDomain(videoFile: VideoFile): VideoPresenter {
        return new VideoPresenter(
            videoFile.originalName,
            videoFile.savedName,
            videoFile.size,
            videoFile.type
        )
    }
}