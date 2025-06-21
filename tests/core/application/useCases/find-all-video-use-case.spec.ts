import { FindAllVideoUseCase } from '@core/application/useCases/find-all-video-use-case'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'

describe('FindAllVideoUseCase', () => {
    const repoMock: {
    findAllVideos: jest.Mock
  } = {
      findAllVideos: jest.fn()
  }
    let cacheMock: { get: jest.Mock; set: jest.Mock }
    let useCase: FindAllVideoUseCase

    beforeEach(() => {
        cacheMock = {
            get: jest.fn(),
            set: jest.fn()
        }
        useCase = new FindAllVideoUseCase(repoMock as any, cacheMock as any)
        jest.clearAllMocks()
    })

    it('deve retornar lista de VideoPresenter se vídeos encontrados (sem customerId)', async () => {
        const videos = [
            { id: 'id-1', foo: 'bar' },
            { id: 'id-2', foo: 'baz' }
        ]
        repoMock.findAllVideos.mockResolvedValue(videos)
        jest.spyOn(VideoPresenter, 'fromDomain').mockImplementation((v) => v as any)
        const result = await useCase.execute({ query: {} })
        expect(repoMock.findAllVideos).toHaveBeenCalledWith({})
        expect(cacheMock.get).not.toHaveBeenCalled()
        expect(result).toEqual(videos)
    })

    it('deve retornar lista de VideoPresenter do cache (com customerId, cache hit)', async () => {
        cacheMock.get.mockResolvedValue([{ id: 'id-1', foo: 'cached' }])
        const result = await useCase.execute({ query: { customerId: 'c1' } })
        expect(cacheMock.get).toHaveBeenCalledWith('videos:customer:c1')
        expect(repoMock.findAllVideos).not.toHaveBeenCalled()
        expect(result).toEqual([{ id: 'id-1', foo: 'cached' }])
    })

    it('deve buscar do repo, salvar no cache e retornar (com customerId, cache miss)', async () => {
        cacheMock.get.mockResolvedValue(null)
        const videos = [
            { id: 'id-1', foo: 'bar' },
            { id: 'id-2', foo: 'baz' }
        ]
        repoMock.findAllVideos.mockResolvedValue(videos)
        jest.spyOn(VideoPresenter, 'fromDomain').mockImplementation((v) => v as any)
        const result = await useCase.execute({ query: { customerId: 'c1' } })
        expect(cacheMock.get).toHaveBeenCalledWith('videos:customer:c1')
        expect(repoMock.findAllVideos).toHaveBeenCalledWith({ customerId: 'c1' })
        expect(cacheMock.set).toHaveBeenCalledWith('videos:customer:c1', videos, 60)
        expect(result).toEqual(videos)
    })

    it('deve retornar lista vazia se não encontrar vídeos (sem customerId)', async () => {
        repoMock.findAllVideos.mockResolvedValue([])
        const result = await useCase.execute({ query: {} })
        expect(repoMock.findAllVideos).toHaveBeenCalledWith({})
        expect(result).toEqual([])
    })

    it('deve retornar lista vazia se não encontrar vídeos (com customerId, cache miss)', async () => {
        cacheMock.get.mockResolvedValue(null)
        repoMock.findAllVideos.mockResolvedValue([])
        const result = await useCase.execute({ query: { customerId: 'c1' } })
        expect(cacheMock.get).toHaveBeenCalledWith('videos:customer:c1')
        expect(repoMock.findAllVideos).toHaveBeenCalledWith({ customerId: 'c1' })
        expect(cacheMock.set).toHaveBeenCalledWith('videos:customer:c1', [], 60)
        expect(result).toEqual([])
    })
})
