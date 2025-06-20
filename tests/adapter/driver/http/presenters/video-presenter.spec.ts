import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { VideoFile } from '@core/domain/entities/video-file'

describe('VideoPresenter', () => {
  it('deve criar um presenter corretamente pelo construtor', () => {
    const presenter = new VideoPresenter('original.mp4', 'videos/saved.mp4', 'video/mp4')
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('original.mp4')
    expect(presenter['savedVideoKey']).toBe('videos/saved.mp4')
    expect(presenter['mimeType']).toBe('video/mp4')
  })

  it('deve criar um presenter a partir de VideoFile', () => {
    const videoFile = {
      originalVideoName: 'orig.mp4',
      savedVideoKey: 'sav.mp4',
      mimeType: 'video/avi',
    } as VideoFile
    const presenter = VideoPresenter.fromDomain(videoFile)
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('orig.mp4')
    expect(presenter['savedVideoKey']).toBe('sav.mp4')
    expect(presenter['mimeType']).toBe('video/avi')
  })
})
