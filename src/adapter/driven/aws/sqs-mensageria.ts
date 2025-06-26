import { 
    DeleteMessageCommand, 
    ReceiveMessageCommand, 
    SQSClient, 
    SendMessageCommand 
} from '@aws-sdk/client-sqs'
import { IMensageria } from '@core/application/ports/mensageria'

export default class SqsMensageria implements IMensageria {
    private readonly client: SQSClient
    static readonly DEFAULT_MAX_NUMBER_OF_MESSAGES = 10
    static readonly DEFAULT_WAIT_TIME_SECONDS = 20

    constructor() {
        this.client = new SQSClient({
            region: process.env.AWS_REGION ?? 'us-east-1',
            ...(process.env.ENVIRONMENT === 'local'
                ? { endpoint: process.env.AWS_LOCAL_ENDPOINT }
                : {}),
        })
    }

    async sendMessage<T>(queueUrl: string, message: T): Promise<void> {
        const params = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        }

        await this.client.send(new SendMessageCommand(params))
    }
    
    async receiveMessages<T>(queueUrl: string): Promise<{ message: T; receiptHandles: string }[]> {
        const command = new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: SqsMensageria.DEFAULT_MAX_NUMBER_OF_MESSAGES,
            WaitTimeSeconds: SqsMensageria.DEFAULT_WAIT_TIME_SECONDS,
        })

        try {
            const response = await this.client.send(command)

            const messages = response.Messages ?? []

            return messages.map((msg) => {
                return {
                    message: JSON.parse(msg.Body ?? '') as T,
                    receiptHandles: msg.ReceiptHandle as string,
                }
            })
        } catch (error) {
            console.error(`Failed to receive messages from queue: ${error}`)
            return []
        }
    }
    async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
        const command = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
        })

        try {
            await this.client.send(command)
        } catch (error) {
            console.error(`Failed to delete message from queue: ${error}`)
        }
    }
}
