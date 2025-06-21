import { FindVideoByIdUseCase } from '@core/application/useCases/find-video-by-id-use-case'
import { VideoNotFoundException } from '@core/domain/exceptions/video-exceptions'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'

describe('FindVideoByIdUseCase', () => {
  const repoMock: { 
    saveVideo: jest.Mock; deleteVideoById: jest.Mock; findVideoById: jest.Mock; 
    updateVideo: jest.Mock; findAllVideos: jest.Mock
  } = {
    saveVideo: jest.fn(),
    deleteVideoById: jest.fn(),
    findVideoById: jest.fn(),
    updateVideo: jest.fn(),
    findAllVideos: jest.fn()
  }

  let useCase: FindVideoByIdUseCase

  beforeEach(() => {
    useCase = new FindVideoByIdUseCase(repoMock)
  })

  it('deve retornar VideoPresenter se vídeo encontrado', async () => {
    const video = { id: 'id-1', foo: 'bar' }
    repoMock.findVideoById.mockResolvedValue(video)
    jest.spyOn(VideoPresenter, 'fromDomain').mockReturnValue({ id: 'id-1', foo: 'bar' } as any)
    const result = await useCase.execute({ id: 'id-1' })
    expect(repoMock.findVideoById).toHaveBeenCalledWith('id-1')
    expect(VideoPresenter.fromDomain).toHaveBeenCalledWith(video)
    expect(result).toEqual({ id: 'id-1', foo: 'bar' })
  })

  it('deve lançar VideoNotFoundException se vídeo não encontrado', async () => {
    repoMock.findVideoById.mockResolvedValue(null)
    await expect(useCase.execute({ id: 'id-nao-existe' }))
        .rejects.toThrow(new VideoNotFoundException('Video not found'))
  })
})
