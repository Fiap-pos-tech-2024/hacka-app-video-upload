import { VideoFile } from '@core/domain/entities/video-file'

export class AsyncUploadPresenter {
    private readonly status: string
    readonly videoId: string
    private readonly message: string
    private constructor(status: string, videoId: string, message: string) {
      this.status = status
      this.videoId = videoId
      this.message = message
    }

    static fromDomain(video: VideoFile) {
        return new AsyncUploadPresenter(
            video.status,
            video.getId(),
            'Upload received and processing will begin shortly.'
        )
  }
}