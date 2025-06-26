import { 
    SQSClient, 
    SendMessageCommand, 
    DeleteMessageCommand, 
    ReceiveMessageCommand 
} from '@aws-sdk/client-sqs'
import SqsMensageria from '@adapter/driven/aws/sqs-mensageria'

jest.mock('@aws-sdk/client-sqs', () => {
    const original = jest.requireActual('@aws-sdk/client-sqs')
    return {
        ...original,
        SQSClient: jest.fn(),
        SendMessageCommand: jest.fn(),
        DeleteMessageCommand: jest.fn(),
        ReceiveMessageCommand: jest.fn(),
    }
})

const mockedSendMessageCommand = SendMessageCommand as unknown as jest.Mock
const mockedDeleteMessageCommand = DeleteMessageCommand as unknown as jest.Mock
const mockedReceiveMessageCommand = ReceiveMessageCommand as unknown as jest.Mock

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

    it('deve deletar mensagem usando o client', async () => {
        mockedDeleteMessageCommand.mockClear()
        const sendMock = jest.fn().mockResolvedValue({})
        ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'queue-url'
        const receiptHandle = 'receipt-handle'

        await mensageria.deleteMessage(queueUrl, receiptHandle)

        expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteMessageCommand))
        expect(mockedDeleteMessageCommand).toHaveBeenCalledWith({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
        })
    })

    it('deve receber mensagens usando o client', async () => {
        mockedReceiveMessageCommand.mockClear()
        const fakeMessages = [
            {
                Body: JSON.stringify({ foo: 'bar' }),
                ReceiptHandle: 'handle1',
            },
            {
                Body: JSON.stringify({ baz: 'qux' }),
                ReceiptHandle: 'handle2',
            },
        ]
        const sendMock = jest.fn().mockResolvedValue({ Messages: fakeMessages })
        ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'queue-url'

        const result = await mensageria.receiveMessages(queueUrl)

        expect(sendMock).toHaveBeenCalledWith(expect.any(ReceiveMessageCommand))
        expect(mockedReceiveMessageCommand).toHaveBeenCalledWith({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
        })
        expect(result).toEqual([
            { message: { foo: 'bar' }, receiptHandles: 'handle1' },
            { message: { baz: 'qux' }, receiptHandles: 'handle2' },
        ])
    })

    it('deve retornar array vazio se receiveMessages lançar erro', async () => {
        const sendMock = jest.fn().mockRejectedValue(new Error('fail'))
        ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'queue-url'
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

        const result = await mensageria.receiveMessages(queueUrl)
        expect(result).toEqual([])
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Failed to receive messages from queue:'))
        spy.mockRestore()
    })

    it('deve logar erro ao falhar em deletar mensagem', async () => {
        const sendMock = jest.fn().mockRejectedValue(new Error('delete fail'))
        ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'queue-url'
        const receiptHandle = 'receipt-handle'
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

        await mensageria.deleteMessage(queueUrl, receiptHandle)
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Failed to delete message from queue:'))
        spy.mockRestore()
    })

    it('deve retornar array vazio se Messages não existir', async () => {
        const sendMock = jest.fn().mockResolvedValue({ Messages: undefined })
        ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'queue-url'
        const result = await mensageria.receiveMessages(queueUrl)
        expect(result).toEqual([])
    })

    it('deve retornar message como undefined se Body não existir', async () => {
        const fakeMessages = [
            {
                Body: undefined,
                ReceiptHandle: 'handle1',
            },
        ]
        const sendMock = jest.fn().mockResolvedValue({ Messages: fakeMessages })
        ;(SQSClient as jest.Mock).mockImplementation(() => ({ send: sendMock }))
        const mensageria = new SqsMensageria()
        const queueUrl = 'queue-url'
        const result = await mensageria.receiveMessages(queueUrl)
        expect(result).toEqual([])
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
