import { VideoFile } from '@core/domain/entities/video-file'
import { VideoFileStatus } from '@core/domain/enums/video-file-status'
import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'

describe('VideoFile', () => {
  const validParams = {
    originalVideoName: 'video.mp4',
    savedVideoKey: 'videos/saved-key.mp4',
    mimeType: 'video/mp4',
  }

  it('deve criar VideoFile válido', () => {
    const video = new VideoFile(validParams)
    expect(video.originalVideoName).toBe('video.mp4')
    expect(video.savedVideoKey).toBe('videos/saved-key.mp4')
    expect(video.mimeType).toBe('video/mp4')
    expect(video.status).toBe(VideoFileStatus.CREATED)
    expect(typeof video.getId()).toBe('string')
  })

  it('deve lançar InvalidFileTypeException para tipo inválido', () => {
    expect(() => new VideoFile({ ...validParams, mimeType: 'video/unknown' }))
      .toThrow(new InvalidFileTypeException('Invalid video file type'))
  })

  it('deve aceitar todos os tipos de vídeo válidos', () => {
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/mkv']
    for (const mimeType of validVideoTypes) {
      expect(() => new VideoFile({ ...validParams, mimeType })).not.toThrow()
    }
  })

  it('deve gerar um id único se não for informado', () => {
    const video = new VideoFile(validParams)
    expect(typeof video.getId()).toBe('string')
    expect(video.getId()).toBeTruthy()
  })

  it('deve usar o id informado se fornecido', () => {
    const video = new VideoFile({ ...validParams, id: 'custom-id-123' })
    expect(video.getId()).toBe('custom-id-123')
  })
})
