const mocks = {
    sqsClientMock: undefined as unknown as jest.Mock,
    sendMessageCommandMock: undefined as unknown as jest.Mock,
}

import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'

jest.mock('@aws-sdk/client-sqs', () => {
    mocks.sqsClientMock = jest.fn()
    mocks.sendMessageCommandMock = jest.fn()
    return {
        SQSClient: mocks.sqsClientMock,
        SendMessageCommand: mocks.sendMessageCommandMock,
    }
})

describe('SqsMensageria', () => {
    let sendMock: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        sendMock = jest.fn().mockResolvedValue({})
        // SQSClient retorna um objeto com método send
        mocks.sqsClientMock.mockImplementation(() => ({ send: sendMock }))
    })

    it('deve instanciar o SQSClient com a região padrão', () => {
        new SqsMensageria()
        expect(mocks.sqsClientMock).toHaveBeenCalledWith({ region: 'us-east-1' })
    })

    it('deve instanciar o SQSClient com endpoint local se ENVIRONMENT=local', () => {
        process.env.AWS_REGION = 'sa-east-1'
        process.env.ENVIRONMENT = 'local'
        process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
        new SqsMensageria()
        expect(mocks.sqsClientMock).toHaveBeenCalledWith({ region: 'sa-east-1', endpoint: 'http://localhost:4566' })
    })

    it('deve enviar mensagem usando o client', async () => {
        const mensageria = new SqsMensageria()
        const queueUrl = 'url'
        const message = { foo: 'bar' }

        await mensageria.sendMessage(queueUrl, message)

        expect(sendMock).toHaveBeenCalledWith(expect.any(mocks.sendMessageCommandMock))
        expect(mocks.sendMessageCommandMock).toHaveBeenCalledWith({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        })
    })

    it('deve falhar se ENVIRONMENT for checado como true ao invés de "local"', () => {
        process.env.AWS_REGION = 'sa-east-1'
        process.env.ENVIRONMENT = 'local'
        process.env.AWS_LOCAL_ENDPOINT = 'http://localhost:4566'
        new SqsMensageria()
        expect(mocks.sqsClientMock).toHaveBeenCalledWith({ region: 'sa-east-1', endpoint: 'http://localhost:4566' })

        process.env.ENVIRONMENT = 'production'
        new SqsMensageria()
        expect(mocks.sqsClientMock).toHaveBeenCalledWith({ region: 'sa-east-1' })
    })
})
