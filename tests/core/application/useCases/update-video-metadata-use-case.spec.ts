import { UpdateVideoMetadataUseCase } from '@core/application/useCases/update-video-metadata-use-case'
import { VideoFileStatus } from '@core/domain/enums/video-file-status'
import { 
    InvalidVideoStatusException, VideoNotFoundException 
} from '@core/domain/exceptions/video-exceptions'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'

describe('UpdateVideoMetadataUseCase', () => {

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

  const useCase = new UpdateVideoMetadataUseCase(repoMock)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve atualizar metadados do vídeo com sucesso', async () => {
    const dto = { id: 'id-1', status: VideoFileStatus.FINISHED, savedZipKey: 'zipkey.zip' }
    const videoDomain = { id: 'id-1' }
    repoMock.findVideoById.mockResolvedValue(videoDomain)
    repoMock.updateVideo.mockResolvedValue(videoDomain)
    jest.spyOn(VideoPresenter, 'fromDomain').mockReturnValue('presenter' as any)
    const result = await useCase.execute(dto)
    expect(repoMock.findVideoById).toHaveBeenCalledWith('id-1')
    expect(repoMock.updateVideo).toHaveBeenCalledWith(dto)
    expect(VideoPresenter.fromDomain).toHaveBeenCalledWith(videoDomain)
    expect(result).toBe('presenter')
  })

  it('deve lançar exceção se status não for informado', async () => {
    await expect(useCase.execute({ id: 'id-1', status: '' }))
        .rejects.toThrow(new InvalidVideoStatusException('Missing video status'))
  })

  it('deve lançar exceção se status for inválido', async () => {
    await expect(useCase.execute({ id: 'id-1', status: 'INVALID' }))
        .rejects.toThrow(new InvalidVideoStatusException('Invalid video status value'))
  })

  it('deve lançar exceção se vídeo não for encontrado', async () => {
    repoMock.findVideoById.mockResolvedValue(null)
    await expect(useCase.execute({ id: 'id-1', status: VideoFileStatus.CREATED }))
        .rejects.toThrow(new VideoNotFoundException('Video not found'))
  })
})
