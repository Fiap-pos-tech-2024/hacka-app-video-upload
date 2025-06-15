import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

export default class SqsMensageria {
    private readonly client: SQSClient

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
        };

        try {
            await this.client.send(new SendMessageCommand(params));
        } catch (error) {
            throw error;
        }
    }
}