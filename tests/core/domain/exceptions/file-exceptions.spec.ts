import { InvalidFileTypeException } from '@core/domain/exceptions/file-exceptions'

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
})
