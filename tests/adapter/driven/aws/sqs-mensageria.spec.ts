import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'

jest.mock('@aws-sdk/client-sqs', () => {
    const original = jest.requireActual('@aws-sdk/client-sqs')
    return {
        ...original,
        SQSClient: jest.fn(),
        SendMessageCommand: jest.fn(),
    }
})

const mockedSendMessageCommand = SendMessageCommand as unknown as jest.Mock

describe('SqsMensageria', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('deve instanciar o SQSClient com a região padrão', () => {
        new SqsMensageria()
        expect(SQSClient).toHaveBeenCalledWith({ region: 'us-east-1' })
    })

    it('deve instanciar o SQSClient com endpoint local se ENVIRONMENT=local', () => {
        process.env.AWS_REGION = 'sa-east-1'
        process.env.ENVIRONMENT = 'local'
        process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
        new SqsMensageria()
        expect(SQSClient).toHaveBeenCalledWith({ region: 'sa-east-1', endpoint: 'http://localhost:4566' })
    })

    it('deve enviar mensagem usando o client', async () => {
        mockedSendMessageCommand.mockClear()
        const sendMock = jest.fn().mockResolvedValue({})
    ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'url'
        const message = { foo: 'bar' }

        await mensageria.sendMessage(queueUrl, message)

        expect(sendMock).toHaveBeenCalledWith(expect.any(SendMessageCommand))
        expect(mockedSendMessageCommand).toHaveBeenCalledWith({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        })
    })
})
it('deve falhar se ENVIRONMENT for checado como true ao invés de "local"', () => {
    process.env.AWS_REGION = 'sa-east-1'
    process.env.ENVIRONMENT = 'local'
    process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
    new SqsMensageria()
    expect(SQSClient).toHaveBeenCalledWith({ region: 'sa-east-1', endpoint: 'http://localhost:4566' })

    process.env.ENVIRONMENT = 'production'
    new SqsMensageria()
    expect(SQSClient).toHaveBeenCalledWith({ region: 'sa-east-1' })
})