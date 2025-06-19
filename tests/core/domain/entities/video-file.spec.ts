import { VideoFile } from '@core/domain/entities/video-file'
import { VideoFileStatus } from '@core/domain/enums/video-file-status'
import { 
    FileSizeExceededException, InvalidFileTypeException 
} from '@core/domain/exceptions/file-exceptions'

describe('VideoFile', () => {
  const validParams = {
    originalVideoName: 'video.mp4',
    filePath: '/tmp/video.mp4',
    size: 1024 * 1024, // 1MB
    type: 'video/mp4',
  }

  it('deve criar VideoFile válido', () => {
    const video = new VideoFile(validParams)
    expect(video.originalVideoName).toBe('video.mp4')
    expect(video.savedVideoName).toBe('video.mp4')
    expect(video.filePath).toBe('/tmp/video.mp4')
    expect(video.size).toBe(1024 * 1024)
    expect(video.type).toBe('video/mp4')
    expect(video.status).toBe(VideoFileStatus.CREATED)
    expect(typeof video.getId()).toBe('string')
  })

  it('deve lançar FileSizeExceededException se tamanho exceder 1GB', () => {
    expect(() => new VideoFile({ ...validParams, size: VideoFile.maxSize + 1 }))
      .toThrow(FileSizeExceededException)
  })

  it('deve lançar InvalidFileTypeException para tipo inválido', () => {
    expect(() => new VideoFile({ ...validParams, type: 'video/unknown' }))
      .toThrow(InvalidFileTypeException)
  })
})
