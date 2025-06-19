import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { VideoFile } from '@core/domain/entities/video-file'

describe('VideoPresenter', () => {
  it('deve criar um presenter corretamente pelo construtor', () => {
    const presenter = new VideoPresenter('original.mp4', 'saved.mp4', 123, 'video/mp4')
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('original.mp4')
    expect(presenter['savedVideoName']).toBe('saved.mp4')
    expect(presenter['size']).toBe(123)
    expect(presenter['type']).toBe('video/mp4')
  })

  it('deve criar um presenter a partir de VideoFile', () => {
    const videoFile = {
      originalVideoName: 'orig.mp4',
      savedVideoName: 'sav.mp4',
      size: 456,
      type: 'video/avi',
    } as VideoFile
    const presenter = VideoPresenter.fromDomain(videoFile)
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('orig.mp4')
    expect(presenter['savedVideoName']).toBe('sav.mp4')
    expect(presenter['size']).toBe(456)
    expect(presenter['type']).toBe('video/avi')
  })
})
