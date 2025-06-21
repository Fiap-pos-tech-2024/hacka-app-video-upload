import { SQSServiceException } from '@aws-sdk/client-sqs'
import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer'

const globalErrorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (err instanceof SQSServiceException) {
        res.status(500).json({ 
            statusCode: 500, 
            message: 'Erro seguir para etapa de processamento do video' 
        })
        return
    }

    let error: MulterError | undefined
    switch (err.name) {
    case 'MulterError':
        error = err as MulterError
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({ statusCode: 413, message: 'Tamanho de arquivo excedido' })
        }
        else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({ statusCode: 400, message: 'Arquivo inesperado' })
        }
        else {
            res.status(500).json({ statusCode: 500, message: 'Erro ao processar arquivo' })
        }
        break
    case 'InvalidFileTypeException':
    case 'InvalidFileException':
    case 'InvalidVideoStatusException':
        res.status(400).json({ statusCode: 400, message: err.message })
        break
    case 'VideoNotFoundException':
        res.status(404).json({ statusCode: 404, message: err.message })
        break
    case 'FileSizeExceededException':
        res.status(413).json({ statusCode: 413, message: err.message })
        break
    default:
        res.status(500).json({ statusCode: 500, message: err.message })
        break
    }
}

export default globalErrorHandler
