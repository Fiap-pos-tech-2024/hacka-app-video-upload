import { UploadVideoUseCase } from '@core/application/useCases/upload-video-use-case'
import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'
import { AsyncUploadPresenter } from '@adapter/driver/http/presenters/async-upload-presenter'

describe('UploadVideoUseCase', () => {
    let videoStorage: { deleteVideo: jest.Mock }
    let videoMetadataRepository: { 
    saveVideo: jest.Mock; deleteVideoById: jest.Mock; findVideoById: jest.Mock; 
    updateVideo: jest.Mock; findAllVideos: jest.Mock
  }
    let mensageria: { sendMessage: jest.Mock }
    let useCase: UploadVideoUseCase

    const originalVideoName = 'video.mp4'
    const savedVideoKey = 'videos/saved-key.mp4'
    const mimeType = 'video/mp4'
    const customerId = 'customer-123'

    beforeEach(() => {
        videoStorage = {
            deleteVideo: jest.fn(),
        }
        videoMetadataRepository = {
            saveVideo: jest.fn(),
            deleteVideoById: jest.fn(),
            updateVideo: jest.fn(),
            findVideoById: jest.fn(),
            findAllVideos: jest.fn(),
        }
        mensageria = {
            sendMessage: jest.fn(),
        }

        process.env.UPLOADED_VIDEO_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'

        useCase = new UploadVideoUseCase(videoStorage, videoMetadataRepository, mensageria)
        jest.clearAllMocks()
    })

    it('deve salvar metadados e enviar mensagem com sucesso', async () => {
        const spy = jest.spyOn(console, 'info').mockImplementation(() => {})
        const result = await useCase.execute({ originalVideoName, savedVideoKey, mimeType, customerId })

        expect(videoMetadataRepository.saveVideo).toHaveBeenCalledWith(expect.objectContaining({
            id: expect.any(String),
            originalVideoName,
            savedVideoKey,
            customerId,
            status: expect.any(String),
        }))
        expect(spy).toHaveBeenCalledWith(`Video file saved: ${savedVideoKey}`)
        expect(mensageria.sendMessage).toHaveBeenCalledWith(
            'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue',
            expect.objectContaining({
                registerId: expect.any(String),
                savedVideoKey,
                originalVideoName,
                type: mimeType,
            })
        )
        expect(spy).toHaveBeenCalledWith(
            'Message sent to SQS queue: https://sqs.us-east-1.amazonaws.com/123456789012/my-queue'
        )
        expect(result).toBeInstanceOf(AsyncUploadPresenter)
        spy.mockRestore()
    })

    it('deve salvar metadados e enviar mensagem com sucesso sem fila SQS', async () => {
        delete process.env.UPLOADED_VIDEO_QUEUE_URL
        useCase = new UploadVideoUseCase(videoStorage, videoMetadataRepository, mensageria)
        const result = await useCase.execute({ originalVideoName, savedVideoKey, mimeType, customerId })

        expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
        expect(mensageria.sendMessage).toHaveBeenCalledWith(
            '',
            expect.objectContaining({
                registerId: expect.any(String),
                savedVideoKey,
                originalVideoName,
                type: mimeType,
            })
        )
        expect(result).toBeInstanceOf(AsyncUploadPresenter)
    })

    it('deve lançar InvalidFileTypeException se a extensão de arquivo for inválida', async () => {
        await expect(useCase.execute({ originalVideoName, savedVideoKey, mimeType: 'fake', customerId }))
            .rejects.toThrow(InvalidFileTypeException)
        expect(videoMetadataRepository.saveVideo).not.toHaveBeenCalled()
        expect(mensageria.sendMessage).not.toHaveBeenCalled()
        expect(videoStorage.deleteVideo).toHaveBeenCalledWith(savedVideoKey)
        expect(videoMetadataRepository.deleteVideoById).not.toHaveBeenCalled()
    })

    it('deve compensar metadados e storage se falhar após salvar ambos', async () => {
        mensageria.sendMessage.mockRejectedValue(new Error('Erro SQS'))
        await expect(useCase.execute({ originalVideoName, savedVideoKey, mimeType, customerId }))
            .rejects.toThrow('Erro SQS')
        expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
        expect(mensageria.sendMessage).toHaveBeenCalled()
        expect(videoMetadataRepository.deleteVideoById).toHaveBeenCalled()
        expect(videoStorage.deleteVideo).toHaveBeenCalledWith(savedVideoKey)
    })

    it('deve compensar apenas storage se falhar ao salvar metadados', async () => {
        videoMetadataRepository.saveVideo.mockRejectedValue(new Error('Erro Metadata'))
        await expect(useCase.execute({ originalVideoName, savedVideoKey, mimeType, customerId }))
            .rejects.toThrow('Erro Metadata')
        expect(videoMetadataRepository.saveVideo).toHaveBeenCalled()
        expect(mensageria.sendMessage).not.toHaveBeenCalled()
        expect(videoMetadataRepository.deleteVideoById).not.toHaveBeenCalled()
        expect(videoStorage.deleteVideo).toHaveBeenCalledWith(savedVideoKey)
    })      
})
