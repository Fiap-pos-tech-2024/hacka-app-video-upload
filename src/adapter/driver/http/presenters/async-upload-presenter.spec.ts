import { AsyncUploadPresenter } from './async-upload-presenter'
import { VideoFile } from '@core/domain/entities/video-file'

describe('AsyncUploadPresenter', () => {
    it('should create a presenter with correct fields from VideoFile', () => {
        const videoFile = new VideoFile({
            originalVideoName: 'test.mp4',
            savedVideoKey: 'abc123',
            mimeType: 'video/mp4'
        })
        const presenter = AsyncUploadPresenter.fromDomain(videoFile)
        expect(presenter).toBeInstanceOf(AsyncUploadPresenter)
        expect((presenter as any).status).toBe(videoFile.status)
        expect(presenter.videoId).toBe(videoFile.getId())
        expect((presenter as any).message).toBe('Upload received and processing will begin shortly.')
    })
})
