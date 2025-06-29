import { Request } from 'express'
import multer from 'multer'
import { uploadConfig, fileFilter } from '@adapter/driver/http/middlewares/upload-file'
import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'

describe('multer-config', () => {
    it('deve aceitar arquivos de vídeo no fileFilter', done => {
        const req = {} as Request
        const file = { mimetype: 'video/mp4' } as Express.Multer.File
        const cb = (err: Error | null, accept?: boolean) => {
            expect(err).toBeNull()
            expect(accept).toBe(true)
            done()
        }
        (fileFilter as (
      req: Express.Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => void)(req, file, cb)
    })

    it('deve rejeitar arquivos não-vídeo no fileFilter', done => {
        const req = {} as Request
        const file = { mimetype: 'image/png' } as Express.Multer.File
        const cb = (err: Error | null, accept?: boolean) => {
            expect(err).toBeInstanceOf(InvalidFileTypeException)
            expect(err!.message).toBe('Invalid video file type')
            expect(accept).toBeUndefined()
            done()
        }
        (fileFilter as (
      req: Express.Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => void)(req, file, cb)
    })

    it('deve ter limite de tamanho de 1GB', () => {
        expect(uploadConfig['limits']?.fileSize).toBe(1024 * 1024 * 1024)
    })

    it('deve gerar key no padrão videos/{uuid}.{extensão}', done => {
        const req = {} as Request
        const file = { originalname: 'meu-video.mkv' } as Express.Multer.File
        const storage = (uploadConfig as unknown as { storage: any }).storage
        const keyFn = storage.key ?? storage.getKey ?? storage._handleFile?.key
        expect(typeof keyFn).toBe('function')
        keyFn(req, file, (_err: Error | null, key: string) => {
            expect(key).toMatch(/^videos\/[\w-]{36}\.mkv$/)
            done()
        })
    })
})
