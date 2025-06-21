import { S3UploadException } from '@core/domain/exceptions/s3-exceptions'

describe('S3UploadException', () => {
    it('deve ter nome correto e mensagem customizada', () => {
        const err = new S3UploadException('erro ao enviar para o S3')
        expect(err).toBeInstanceOf(Error)
        expect(err.name).toBe('S3UploadException')
        expect(err.message).toBe('erro ao enviar para o S3')
    })
})
