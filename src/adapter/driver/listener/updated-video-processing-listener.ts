import { UpdateVideoMetadataUseCaseDto } from '@core/application/dtos/update-video-metadata-use-case-dto'
import { IMensageria } from '@core/application/ports/mensageria'
import { UpdateVideoMetadataUseCase } from '@core/application/useCases/update-video-metadata-use-case'

export class UpdatedVideoProcessingListener {
    private readonly mensageria: IMensageria
    private readonly queueUrl: string
    private readonly updateVideoMetadataUseCase: UpdateVideoMetadataUseCase

    constructor(mensageria: IMensageria, updateVideoMetadataUseCase: UpdateVideoMetadataUseCase) {
        this.mensageria = mensageria
        this.queueUrl = process.env.UPDATED_VIDEO_PROCESSING_QUEUE_URL ?? ''
        this.updateVideoMetadataUseCase = updateVideoMetadataUseCase
    }

    async listen(): Promise<void> {
        console.info('Starting Updated Video Processing Listener...')
        const keepListening = true
        while (keepListening) {
            await this.processUpdatedVideoMessage()

            // Aguardar antes de obter novas mensagens
            await new Promise(resolve => setTimeout(resolve, 15000))
        }
    }

    private async processUpdatedVideoMessage(): Promise<void> {
        try {
            const messages = await this.mensageria
                .receiveMessages<UpdateVideoMetadataUseCaseDto>(this.queueUrl)

            for (const { message, receiptHandles } of messages) {
                console.info('Processing updated video message:', message)
                
                this.updateVideoMetadataUseCase.execute(message)

                await this.mensageria.deleteMessage(this.queueUrl, receiptHandles)
            }
        } catch (error) {
            console.error('Error processing updated video message:', error)
        }
    }
}