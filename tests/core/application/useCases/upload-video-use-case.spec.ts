import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import { 
  FileSizeExceededException, InvalidFileException, InvalidFileTypeException 
} from '@core/domain/exceptions/file-exceptions'
import { VideoPresenter } from '@adapter/driver/http/presenters/video-presenter'
import { 
  getFileSize as _getFileSize, getFileType as _getFileType, removeFile as _removeFile 
} from '@core/application/utils/file-utils'
import { VideoFileStatus } from '@core/domain/enums/video-file-status'


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

    process.env.UPLOADED_VIDEO_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'

    useCase = new UploadVideoUseCase(videoStorage, videoMetadataRepository, mensageria)
    jest.clearAllMocks()
  })

  it('deve salvar vídeo, metadados e enviar mensagem com sucesso', async () => {
    getFileSize.mockReturnValue(100)
    getFileType.mockReturnValue('video/mp4')
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {})
    const result = await useCase.execute({ filePath, originalVideoName, customerId })

    expect(spy).toHaveBeenCalledWith('Video file saved: video.mp4')
    expect(spy).toHaveBeenCalledWith('Message sent to SQS queue: https://sqs.us-east-1.amazonaws.com/123456789012/my-queue')
    expect(videoStorage.saveVideo).toHaveBeenCalledWith(expect.objectContaining({
      originalVideoName,
      filePath,
      size: 100,
      type: 'video/mp4',
    }))
    expect(videoMetadataRepository.saveVideo).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      originalVideoName,
      savedVideoName: 'video.mp4',
      customerId,
      status: VideoFileStatus.CREATED,
    }))
    expect(mensageria.sendMessage).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue',
      expect.objectContaining({
        savedVideoName: 'video.mp4',
        originalVideoName,
        size: 100,
        type: 'video/mp4',
      })
    )
    expect(result).toBeInstanceOf(VideoPresenter)
  })

  it('deve salvar vídeo, metadados e enviar mensagem com sucesso sem fila SQS', async () => {
    getFileSize.mockReturnValue(100)
    getFileType.mockReturnValue('video/mp4')
    delete process.env.UPLOADED_VIDEO_QUEUE_URL
    useCase = new UploadVideoUseCase(videoStorage, videoMetadataRepository, mensageria)
    const result = await useCase.execute({ filePath, originalVideoName, customerId })

    expect(videoStorage.saveVideo).toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
    expect(mensageria.sendMessage).toHaveBeenCalledWith(
      '',
      expect.objectContaining({
        savedVideoName: 'video.mp4',
        originalVideoName,
        size: 100,
        type: 'video/mp4',
      })
    )
    expect(result).toBeInstanceOf(VideoPresenter)
  })

  it('deve lançar InvalidFileException se o arquivo não existir', async () => {
    getFileSize.mockReturnValue(0)
    getFileType.mockReturnValue('video/mp4')

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
        .rejects.toMatchObject({
          message: 'File is empty.',
          constructor: InvalidFileException
        })
    expect(videoStorage.saveVideo).not.toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).not.toHaveBeenCalled()
    expect(videoStorage.deleteVideo).not.toHaveBeenCalled()
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

  it('deve compensar apenas tmp storage se falhar após salvar vídeo no storage', async () => {
    getFileSize.mockReturnValue(100)
    getFileType.mockReturnValue('video/mp4')
    videoStorage.saveVideo.mockRejectedValue(new Error('Erro Storage'))

    await expect(useCase.execute({ filePath, originalVideoName, customerId }))
      .rejects.toThrow('Erro Storage')

    expect(videoStorage.saveVideo).toHaveBeenCalled()
    expect(videoMetadataRepository.saveVideo).not.toHaveBeenCalled()
    expect(mensageria.sendMessage).not.toHaveBeenCalled()
    expect(videoMetadataRepository.deleteVideoById).not.toHaveBeenCalled()
    expect(videoStorage.deleteVideo).not.toHaveBeenCalled()
    expect(removeFile).toHaveBeenCalledWith(filePath)
  })      
})
