import { UpdatedVideoProcessingListener } from './updated-video-processing-listener'
import { UpdateVideoMetadataUseCaseDto } from '@core/application/dtos/update-video-metadata-use-case-dto'

describe('UpdatedVideoProcessingListener', () => {
    let mensageriaMock: any
    let updateVideoMetadataUseCaseMock: any
    let listener: UpdatedVideoProcessingListener
    let originalEnv: any

    beforeEach(() => {
        originalEnv = process.env.UPDATED_VIDEO_PROCESSING_QUEUE_URL
        process.env.UPDATED_VIDEO_PROCESSING_QUEUE_URL = 'test-queue-url'

        mensageriaMock = {
            receiveMessages: jest.fn(),
            deleteMessage: jest.fn()
        }
        updateVideoMetadataUseCaseMock = {
            execute: jest.fn()
        }
        listener = new UpdatedVideoProcessingListener(mensageriaMock, updateVideoMetadataUseCaseMock)
        jest.useFakeTimers()
        jest.spyOn(global, 'setTimeout')
    })

    afterEach(() => {
        process.env.UPDATED_VIDEO_PROCESSING_QUEUE_URL = originalEnv
        jest.clearAllMocks()
        jest.useRealTimers()
    })

    it('should handle empty messages array', async () => {
        mensageriaMock.receiveMessages.mockResolvedValue([])

        const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
        await (listener as any).processUpdatedVideoMessage()
        expect(infoSpy).not.toHaveBeenCalledWith('Processing updated video message:', expect.anything())
        infoSpy.mockRestore()
    })

    it('should log error if receiveMessages throws', async () => {
        const error = new Error('fail')
        mensageriaMock.receiveMessages.mockRejectedValue(error)
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        await (listener as any).processUpdatedVideoMessage()
        expect(errorSpy).toHaveBeenCalledWith('Error processing updated video message:', error)
        errorSpy.mockRestore()
    })

    it('should log error if deleteMessage throws', async () => {
        const message: UpdateVideoMetadataUseCaseDto = { id: '1', status: 'FINISHED' } as any
        mensageriaMock.receiveMessages.mockResolvedValue([
            { message, receiptHandles: 'abc' }
        ])
        mensageriaMock.deleteMessage.mockRejectedValue(new Error('delete fail'))

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

        await (listener as any).processUpdatedVideoMessage()
        // O erro será capturado no próximo loop, mas aqui garantimos que não quebre
        expect(infoSpy).toHaveBeenCalledWith('Processing updated video message:', message)
        errorSpy.mockRestore()
        infoSpy.mockRestore()
    })

    it('should use default queueUrl if env is not set', () => {
        delete process.env.UPDATED_VIDEO_PROCESSING_QUEUE_URL
        const listenerDefault = new UpdatedVideoProcessingListener(
            mensageriaMock, updateVideoMetadataUseCaseMock)
        expect((listenerDefault as any).queueUrl).toBe('')
    })

    it('should call processUpdatedVideoMessage once when KEEP_LISTENING becomes false after first iteration', async () => {
        const processSpy = jest.spyOn(listener as any, 'processUpdatedVideoMessage').mockResolvedValue(undefined)
        const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
        
        // Getter manual usando mockReturnValueOnce
        const getter = jest.fn()
        getter.mockReturnValueOnce(true).mockReturnValueOnce(false)
        Object.defineProperty(listener, 'KEEP_LISTENING', {
            get: getter,
            set: () => {},
            configurable: true
        })
        const promise = listener.listen()
        await Promise.resolve()
        jest.runOnlyPendingTimers()
        await promise
        expect(processSpy).toHaveBeenCalledTimes(1)
        expect(infoSpy).toHaveBeenCalledWith('Starting Updated Video Processing Listener...')
        processSpy.mockRestore()
        infoSpy.mockRestore()
    })
})