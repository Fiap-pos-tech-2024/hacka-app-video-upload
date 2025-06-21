import { FindAllVideoUseCase } from '@core/application/useCases/find-all-video-use-case'
import { VideoNotFoundException } from '@core/domain/exceptions/video-exceptions'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'

describe('FindAllVideoUseCase', () => {
  const repoMock: {
    findAllVideos: jest.Mock
  } = {
    findAllVideos: jest.fn()
  }
  let useCase: FindAllVideoUseCase

  beforeEach(() => {
    useCase = new FindAllVideoUseCase(repoMock as any)
    jest.clearAllMocks()
  })

  it('deve retornar lista de VideoPresenter se vídeos encontrados', async () => {
    const videos = [
      { id: 'id-1', foo: 'bar' },
      { id: 'id-2', foo: 'baz' }
    ]
    repoMock.findAllVideos.mockResolvedValue(videos)
    jest.spyOn(VideoPresenter, 'fromDomain').mockImplementation((v) => v as any)
    const result = await useCase.execute({ query: {} })
    expect(repoMock.findAllVideos).toHaveBeenCalledWith({})
    expect(result).toEqual(videos)
  })

  it('deve lançar VideoNotFoundException se não encontrar vídeos', async () => {
    repoMock.findAllVideos.mockResolvedValue(undefined)
    await expect(useCase.execute({ query: {} }))
        .rejects.toThrow(new VideoNotFoundException('Videos not found'))
  })
})
