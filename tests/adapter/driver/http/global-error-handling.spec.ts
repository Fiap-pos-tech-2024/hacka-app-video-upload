import globalErrorHandler from '@adapter/driver/http/global-error-handling'
import { SQSServiceException } from '@aws-sdk/client-sqs'
import { MulterError } from 'multer'

describe('globalErrorHandler', () => {
    let res: any
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
    })

    function expectResponse(status: number, message: string) {
        expect(res.status).toHaveBeenCalledWith(status)
        expect(res.json).toHaveBeenCalledWith({ statusCode: status, message })
    }

    it('deve tratar SQSServiceException', () => {
        const err = new SQSServiceException(
            { $metadata: {}, name: 'SQSServiceException', $fault: 'client' }
        )
        globalErrorHandler(err, {} as any, res, jest.fn())
        expectResponse(500, 'Erro seguir para etapa de processamento do video')
    })

    it('deve tratar MulterError LIMIT_FILE_SIZE', () => {
        const err = new MulterError('LIMIT_FILE_SIZE')
        globalErrorHandler(err, {} as any, res, jest.fn())
        expectResponse(413, 'Tamanho de arquivo excedido')
    })

    it('deve tratar MulterError LIMIT_UNEXPECTED_FILE', () => {
        const err = new MulterError('LIMIT_UNEXPECTED_FILE')
        globalErrorHandler(err, {} as any, res, jest.fn())
        expectResponse(400, 'Arquivo inesperado')
    })

    it('deve tratar MulterError genérico', () => {
        const err = { name: 'MulterError', code: 'GENERIC' } as any
        globalErrorHandler(err, {} as any, res, jest.fn())
        expectResponse(500, 'Erro ao processar arquivo')
    })

    it('deve tratar InvalidFileTypeException', () => {
        const err = { name: 'InvalidFileTypeException', message: 'Tipo inválido' }
        globalErrorHandler(err as any, {} as any, res, jest.fn())
        expectResponse(400, 'Tipo inválido')
    })

    it('deve tratar InvalidFileException', () => {
        const err = { name: 'InvalidFileException', message: 'Arquivo inválido' }
        globalErrorHandler(err as any, {} as any, res, jest.fn())
        expectResponse(400, 'Arquivo inválido')
    })

    it('deve tratar FileSizeExceededException', () => {
        const err = { name: 'FileSizeExceededException', message: 'Arquivo grande' }
        globalErrorHandler(err as any, {} as any, res, jest.fn())
        expectResponse(413, 'Arquivo grande')
    })

    it('deve tratar erro genérico', () => {
        const err = { name: 'OtherError', message: 'Erro desconhecido' }
        globalErrorHandler(err as any, {} as any, res, jest.fn())
        expectResponse(500, 'Erro desconhecido')
    })

    it('deve tratar InvalidVideoStatusException', () => {
        const err = { name: 'InvalidVideoStatusException', message: 'Status inválido' }
        globalErrorHandler(err as any, {} as any, res, jest.fn())
        expectResponse(400, 'Status inválido')
    })

    it('deve tratar VideoNotFoundException', () => {
        const err = { name: 'VideoNotFoundException', message: 'Não encontrado' }
        globalErrorHandler(err as any, {} as any, res, jest.fn())
        expectResponse(404, 'Não encontrado')
    })
})
