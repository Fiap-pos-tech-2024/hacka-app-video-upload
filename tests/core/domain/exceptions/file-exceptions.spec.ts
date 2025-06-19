import {
    InvalidFileTypeException, FileSizeExceededException, InvalidFileException
} from '@core/domain/exceptions/file-exceptions'

describe('File Exceptions', () => {
  it('InvalidFileTypeException deve ter nome e mensagem padrão', () => {
    const err = new InvalidFileTypeException()
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('InvalidFileTypeException')
    expect(err.message).toBe('Invalid video file type')
  })

  it('InvalidFileTypeException deve aceitar mensagem customizada', () => {
    const err = new InvalidFileTypeException('custom')
    expect(err.message).toBe('custom')
  })

  it('FileSizeExceededException deve ter nome e mensagem padrão', () => {
    const err = new FileSizeExceededException()
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('FileSizeExceededException')
    expect(err.message).toBe('File size exceeds 1GB')
  })

  it('FileSizeExceededException deve aceitar mensagem customizada', () => {
    const err = new FileSizeExceededException('custom')
    expect(err.message).toBe('custom')
  })

  it('InvalidFileException deve ter nome e mensagem padrão', () => {
    const err = new InvalidFileException()
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('InvalidFileException')
    expect(err.message).toBe('Invalid video file')
  })

  it('InvalidFileException deve aceitar mensagem customizada', () => {
    const err = new InvalidFileException('custom')
    expect(err.message).toBe('custom')
  })
})
