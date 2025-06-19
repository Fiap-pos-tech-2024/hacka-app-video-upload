import * as fs from 'fs'
import { getFileSize, getFileType, removeFile } from '@core/application/utils/file-utils'

jest.mock('fs')

describe('file-utils', () => {
  const filePath = '/tmp/testfile.mp4'
  const existsSync = fs.existsSync as jest.Mock
  const statSync = fs.statSync as jest.Mock
  const unlinkSync = fs.unlinkSync as jest.Mock

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getFileSize', () => {
    it('deve retornar 0 se o arquivo não existir', () => {
      existsSync.mockReturnValue(false)
      expect(getFileSize(filePath)).toBe(0)
    })

    it('deve retornar o tamanho do arquivo se existir', () => {
      existsSync.mockReturnValue(true)
      statSync.mockReturnValue({ size: 12345 })
      expect(getFileSize(filePath)).toBe(12345)
    })
  })

  describe('getFileType', () => {
    it('deve retornar video/mp4 para arquivos .mp4', () => {
      expect(getFileType('video.mp4')).toBe('video/mp4')
    })
    it('deve retornar video/mpeg para arquivos .mpeg', () => {
      expect(getFileType('video.mpeg')).toBe('video/mpeg')
    })
    it('deve retornar video/mpeg para arquivos .mpg', () => {
      expect(getFileType('video.mpg')).toBe('video/mpeg')
    })
    it('deve retornar video/avi para arquivos .avi', () => {
      expect(getFileType('video.avi')).toBe('video/avi')
    })
    it('deve retornar video/mkv para arquivos .mkv', () => {
      expect(getFileType('video.mkv')).toBe('video/mkv')
    })
    it('deve retornar unknown para extensões não suportadas', () => {
      expect(getFileType('video.txt')).toBe('unknown')
    })
    it('deve ser case insensitive', () => {
      expect(getFileType('video.MP4')).toBe('video/mp4')
    })
    it('deve retornar unknown para arquivos sem nome e extensão', () => {
      expect(getFileType('.')).toBe('unknown')
    })
    it('deve retornar unknown para arquivos sem extensão', () => {
        expect(getFileType('file')).toBe('unknown')
    })
    it('deve falhar se a lógica de extração da extensão for alterada para não pegar a última parte', 
      () => {
        expect(getFileType('archive.tar.mp4')).toBe('video/mp4')
        expect(getFileType('archive.mp4.tar')).toBe('unknown')
    })
  })

  describe('removeFile', () => {
    it('deve remover o arquivo se existir', () => {
      existsSync.mockReturnValue(true)
      removeFile(filePath)
      expect(unlinkSync).toHaveBeenCalledWith(filePath)
    })
    it('não deve tentar remover se o arquivo não existir', () => {
      existsSync.mockReturnValue(false)
      removeFile(filePath)
      expect(unlinkSync).not.toHaveBeenCalled()
    })
  })
})
