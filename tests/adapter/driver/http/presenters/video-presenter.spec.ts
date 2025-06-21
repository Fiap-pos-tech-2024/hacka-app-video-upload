import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { VideoFile } from '@core/domain/entities/video-file'

describe('VideoPresenter', () => {
  it('deve criar um presenter corretamente pelo construtor', () => {
    const presenter = new VideoPresenter(
      'id',
      'original.mp4',
      'videos/saved.mp4',
      'status',
      'customer-1',
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-02T00:00:00Z'),
      'videos/saved.zip'
    )
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('original.mp4')
    expect(presenter['savedVideoKey']).toBe('videos/saved.mp4')
    expect(presenter['status']).toBe('status')
    expect(presenter['customerId']).toBe('customer-1')
    expect(presenter['createdAt']).toEqual(new Date('2024-01-01T00:00:00Z'))
    expect(presenter['updatedAt']).toEqual(new Date('2024-01-02T00:00:00Z'))
    expect(presenter['savedZipKey']).toBe('videos/saved.zip')
  })

  it('deve criar um presenter a partir de VideoFile', () => {
    const videoFile = {
      getId: () => 'id-2',
      originalVideoName: 'orig.mp4',
      savedVideoKey: 'sav.mp4',
      status: 'done',
      customerId: 'customer-2',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-02T00:00:00Z',
      savedZipKey: 'sav.zip'
    } as unknown as VideoFile
    const presenter = VideoPresenter.fromDomain(videoFile)
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('orig.mp4')
    expect(presenter['savedVideoKey']).toBe('sav.mp4')
    expect(presenter['status']).toBe('done')
    expect(presenter['customerId']).toBe('customer-2')
    expect(presenter['createdAt']).toBe('2024-02-01T00:00:00Z')
    expect(presenter['updatedAt']).toBe('2024-02-02T00:00:00Z')
    expect(presenter['savedZipKey']).toBe('sav.zip')
  })

  it('deve criar um presenter apenas com os campos obrigatórios', () => {
    const presenter = new VideoPresenter(
      'id-obrigatorio',
      'video-obrigatorio.mp4',
      'videos/obrigatorio.mp4',
      'em-processamento'
    )
    expect(presenter).toBeInstanceOf(VideoPresenter)
    expect(presenter['originalVideoName']).toBe('video-obrigatorio.mp4')
    expect(presenter['savedVideoKey']).toBe('videos/obrigatorio.mp4')
    expect(presenter['status']).toBe('em-processamento')
    expect(presenter['customerId']).toBeUndefined()
    expect(presenter['createdAt']).toBeUndefined()
    expect(presenter['updatedAt']).toBeUndefined()
    expect(presenter['savedZipKey']).toBeUndefined()
  })
})
