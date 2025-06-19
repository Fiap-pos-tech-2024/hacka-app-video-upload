import path from 'path'
import { Request } from 'express'
import { uploadConfig, storage, fileFilter } from '@adapter/driver/http/config/multer-config'
import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'

describe('multer-config', () => {
  it('deve definir o destino corretamente', done => {
    const req = {} as Request
    const file = {} as Express.Multer.File
    (storage as any).getDestination(req, file, (err: Error | null, dest: string) => {
      expect(err).toBeNull()
      expect(dest).toContain(path.join(process.cwd(), 'tmp', 'uploads'))
      done()
    })
  })

  it('deve gerar um nome de arquivo com uuid e extensão', done => {
    const req = {} as Request
    const file = { originalname: 'video.mp4' } as Express.Multer.File
    (storage as any).getFilename(req, file, (err: Error | null, filename: string) => {
      expect(err).toBeNull()
      expect(filename).toMatch(/^[\w-]{36}\.mp4$/)
      done()
    })
  })

  it('deve aceitar arquivos de vídeo no fileFilter', done => {
    const req = {} as Request
    const file = { mimetype: 'video/mp4' } as Express.Multer.File
    const cb = (err: Error | null, accept?: boolean) => {
      expect(err).toBeNull()
      expect(accept).toBe(true)
      done()
    }
    fileFilter(req, file, cb)
  })

  it('deve rejeitar arquivos não-vídeo no fileFilter', done => {
    const req = {} as Request
    const file = { mimetype: 'image/png' } as Express.Multer.File
    const cb = (err: Error | null, accept?: boolean) => {
      expect(err).toBeInstanceOf(InvalidFileTypeException)
      expect(accept).toBeUndefined()
      done()
    }
    fileFilter(req, file, cb)
  })

  it('deve ter limite de tamanho de 1GB', () => {
    expect(uploadConfig['limits']?.fileSize).toBe(1024 * 1024 * 1024)
  })
})
