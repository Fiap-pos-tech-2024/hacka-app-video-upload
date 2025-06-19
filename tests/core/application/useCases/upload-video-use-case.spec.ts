import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import { 
  FileSizeExceededException, InvalidFileException, InvalidFileTypeException 
} from '@core/domain/exceptions/file-exceptions'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { 
  getFileSize as _getFileSize, getFileType as _getFileType, removeFile as _removeFile 
} from '@core/application/utils/file-utils'


jest.mock('@core/application/utils/file-utils', () => ({
  getFileSize: jest.fn(),
  getFileType: jest.fn(),
  removeFile: jest.fn(),
}))


const getFileSize = _getFileSize as jest.Mock
const getFileType = _getFileType as jest.Mock
const removeFile = _removeFile as jest.Mock

describe('UploadVideoUseCase', () => {
  let videoStorage: any
  let videoMetadataRepository: any
  let mensageria: any
  let useCase: UploadVideoUseCase

  const filePath = 'path/to/video.mp4'
  const originalVideoName = 'video.mp4'
  const customerId = 'customer-123'

  beforeEach(() => {
    videoStorage = {
      saveVideo: jest.fn(),
      deleteVideo: jest.fn(),
    }
    videoMetadataRepository = {
      saveVideo: jest.fn(),
      deleteVideoById: jest.fn(),
    }
    mensageria = {
      sendMessage: jest.fn(),
    }
    useCase = new UploadVideoUseCase(videoStorage, videoMetadataRepository, mensageria)
    jest.clearAllMocks()
  })

  it('deve salvar vídeo, metadados e enviar mensagem com sucesso', async () => {
    getFileSize.mockReturnValue(100)
    getFileType.mockReturnValue('video/mp4')
    const result = await useCase.execute({ filePath, originalVideoName, customerId })

    expect(videoStorage.saveVideo).toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
    expect(mensageria.sendMessage).toHaveBeenCalled()
    expect(result).toBeInstanceOf(VideoPresenter)
  })

  it('deve lançar InvalidFileException se o arquivo não existir', async () => {
    getFileSize.mockReturnValue(0)
    getFileType.mockReturnValue('video/mp4')

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
      .rejects.toThrow(InvalidFileException)
    expect(videoStorage.saveVideo).not.toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).not.toHaveBeenCalled()
    expect(mensageria.sendMessage).not.toHaveBeenCalled()
    expect(removeFile).toHaveBeenCalledWith(filePath)
  })

  it('deve lançar InvalidFileTypeException se a extensão de arquivo for inválida', async () => {
    getFileSize.mockReturnValue(1)
    getFileType.mockReturnValue('unknown')

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
      .rejects.toThrow(InvalidFileTypeException)
    expect(videoStorage.saveVideo).not.toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).not.toHaveBeenCalled()
    expect(mensageria.sendMessage).not.toHaveBeenCalled()
    expect(removeFile).toHaveBeenCalledWith(filePath)
  })

  it('deve lançar FileSizeExceededException se arquivo ultrapassar 1GB', async () => {
    getFileSize.mockReturnValue(1024*1024*1024*1024 + 1)
    getFileType.mockReturnValue('video/mp4')

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
      .rejects.toThrow(FileSizeExceededException)
    expect(videoStorage.saveVideo).not.toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).not.toHaveBeenCalled()
    expect(mensageria.sendMessage).not.toHaveBeenCalled()
    expect(removeFile).toHaveBeenCalledWith(filePath)
  })

  it('deve compensar metadados e vídeo se falhar após salvar ambos', async () => {
    getFileSize.mockReturnValue(100)
    getFileType.mockReturnValue('video/mp4')
    mensageria.sendMessage.mockRejectedValue(new Error('Erro SQS'))

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
      .rejects.toThrow('Erro SQS')
    
    expect(videoStorage.saveVideo).toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
    expect(mensageria.sendMessage).toHaveBeenCalled()

    expect(videoMetadataRepository.deleteVideoById).toHaveBeenCalled()
    expect(videoStorage.deleteVideo).toHaveBeenCalled()
    expect(removeFile).toHaveBeenCalledWith(filePath)
  })

  it('deve compensar apenas vídeo storage se falhar após salvar vídeo metadados', async () => {
    getFileSize.mockReturnValue(100)
    getFileType.mockReturnValue('video/mp4')
    videoMetadataRepository.saveVideo.mockRejectedValue(new Error('Erro Metadata'))

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
      .rejects.toThrow('Erro Metadata')
    
    expect(videoStorage.saveVideo).toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
    expect(mensageria.sendMessage).not.toHaveBeenCalled()
    expect(videoMetadataRepository.deleteVideoById).not.toHaveBeenCalled()
    expect(videoStorage.deleteVideo).toHaveBeenCalled()
    expect(removeFile).toHaveBeenCalledWith(filePath)
  })
})
