import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer';

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  switch (err.name) {
    case 'MulterError':
      let error = err as MulterError
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
      res.status(400).json({ statusCode: 400, message: err.message })
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
