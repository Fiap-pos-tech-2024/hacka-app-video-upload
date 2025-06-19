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

  it('deve criar VideoFile válido se possuir menos de 1GB', () => {
    const video = new VideoFile(validParams)
    expect(video.originalVideoName).toBe('video.mp4')
    expect(video.savedVideoName).toBe('video.mp4')
    expect(video.filePath).toBe('/tmp/video.mp4')
    expect(video.size).toBe(1024 * 1024)
    expect(video.type).toBe('video/mp4')
    expect(video.status).toBe(VideoFileStatus.CREATED)
    expect(typeof video.getId()).toBe('string')
  })

  it('deve criar VideoFile válido se possuir 1GB', () => {
    const video = new VideoFile({ ...validParams, size: VideoFile.maxSize })
    expect(video.originalVideoName).toBe('video.mp4')
    expect(video.savedVideoName).toBe('video.mp4')
    expect(video.filePath).toBe('/tmp/video.mp4')
    expect(video.size).toBe(VideoFile.maxSize)
    expect(video.type).toBe('video/mp4')
    expect(video.status).toBe(VideoFileStatus.CREATED)
    expect(typeof video.getId()).toBe('string')
  })

  it('deve lançar FileSizeExceededException se tamanho exceder 1GB', () => {
    expect(() => new VideoFile({ ...validParams, size: VideoFile.maxSize + 1 }))
      .toThrow(FileSizeExceededException)
    expect(() => new VideoFile({ ...validParams, size: VideoFile.maxSize + 1 }))
      .toThrow('File size exceeds 1GB')
  })

  it('deve lançar InvalidFileTypeException para tipo inválido', () => {
    expect(() => new VideoFile({ ...validParams, type: 'video/unknown' }))
      .toThrow(new InvalidFileTypeException('Invalid video file type'))
  })

  it('deve aceitar todos os tipos de vídeo válidos', () => {
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/avi', 'video/mkv']

    for (const type of validVideoTypes) {
      expect(() => new VideoFile({ ...validParams, type })).not.toThrow()
    }
  })

  it('deve definir savedVideoName corretamente a partir do filePath', () => {
    const video = new VideoFile(
      { ...validParams, filePath: '/tmp/another-video.mkv', type: 'video/mkv' })
    expect(video.savedVideoName).toBe('another-video.mkv')
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
