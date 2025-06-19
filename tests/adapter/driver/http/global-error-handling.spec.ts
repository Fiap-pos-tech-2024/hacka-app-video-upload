import globalErrorHandler from '../../../../src/adapter/driver/http/global-error-handling'
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

  it('deve tratar SQSServiceException', () => {
    const err = new SQSServiceException(
        { $metadata: {}, name: 'SQSServiceException', $fault: 'client' }
    )
    globalErrorHandler(err, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 500, 
        message: 'Erro seguir para etapa de processamento do video' })
  })

  it('deve tratar MulterError LIMIT_FILE_SIZE', () => {
    const err = new MulterError('LIMIT_FILE_SIZE')
    globalErrorHandler(err, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(413)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 413, message: 'Tamanho de arquivo excedido' })
  })

  it('deve tratar MulterError LIMIT_UNEXPECTED_FILE', () => {
    const err = new MulterError('LIMIT_UNEXPECTED_FILE')
    globalErrorHandler(err, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Arquivo inesperado' })
  })

  it('deve tratar MulterError genérico', () => {
    const err = { name: 'MulterError', code: 'GENERIC' } as any
    globalErrorHandler(err, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 500, message: 'Erro ao processar arquivo' })
  })

  it('deve tratar InvalidFileTypeException', () => {
    const err = { name: 'InvalidFileTypeException', message: 'Tipo inválido' }
    globalErrorHandler(err as any, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Tipo inválido' })
  })

  it('deve tratar InvalidFileException', () => {
    const err = { name: 'InvalidFileException', message: 'Arquivo inválido' }
    globalErrorHandler(err as any, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Arquivo inválido' })
  })

  it('deve tratar FileSizeExceededException', () => {
    const err = { name: 'FileSizeExceededException', message: 'Arquivo grande' }
    globalErrorHandler(err as any, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(413)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 413, message: 'Arquivo grande' })
  })

  it('deve tratar erro genérico', () => {
    const err = { name: 'OtherError', message: 'Erro desconhecido' }
    globalErrorHandler(err as any, {} as any, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ statusCode: 500, message: 'Erro desconhecido' })
  })
})
