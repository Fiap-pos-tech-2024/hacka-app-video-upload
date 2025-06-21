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

    let cacheMock: { get: jest.Mock; set: jest.Mock }
    let useCase: FindVideoByIdUseCase

    beforeEach(() => {
        cacheMock = {
            get: jest.fn(),
            set: jest.fn()
        }
        useCase = new FindVideoByIdUseCase(repoMock as any, cacheMock as any)
        jest.clearAllMocks()
    })

    it('deve retornar VideoPresenter se vídeo encontrado (cache miss)', async () => {
        cacheMock.get.mockResolvedValue(null)
        const video = { id: 'id-1', foo: 'bar' }
        repoMock.findVideoById.mockResolvedValue(video)
        jest.spyOn(VideoPresenter, 'fromDomain').mockReturnValue({ id: 'id-1', foo: 'bar' } as any)
        const result = await useCase.execute({ id: 'id-1' })
        expect(cacheMock.get).toHaveBeenCalledWith('video:id-1')
        expect(repoMock.findVideoById).toHaveBeenCalledWith('id-1')
        expect(VideoPresenter.fromDomain).toHaveBeenCalledWith(video)
        expect(cacheMock.set).toHaveBeenCalledWith('video:id-1', { id: 'id-1', foo: 'bar' }, 60)
        expect(result).toEqual({ id: 'id-1', foo: 'bar' })
    })

    it('deve retornar VideoPresenter do cache (cache hit)', async () => {
        cacheMock.get.mockResolvedValue({ id: 'id-1', foo: 'cached' })
        const result = await useCase.execute({ id: 'id-1' })
        expect(cacheMock.get).toHaveBeenCalledWith('video:id-1')
        expect(repoMock.findVideoById).not.toHaveBeenCalled()
        expect(result).toEqual({ id: 'id-1', foo: 'cached' })
    })

    it('deve lançar VideoNotFoundException se vídeo não encontrado', async () => {
        cacheMock.get.mockResolvedValue(null)
        repoMock.findVideoById.mockResolvedValue(null)
        await expect(useCase.execute({ id: 'id-nao-existe' }))
            .rejects.toThrow(new VideoNotFoundException('Video not found'))
    })
})
