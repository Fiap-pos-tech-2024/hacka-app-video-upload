import { 
    InvalidVideoStatusException, VideoNotFoundException 
} from '@core/domain/exceptions/video-exceptions'

describe('InvalidVideoStatusException', () => {
  it('deve criar a exceção com a mensagem padrão', () => {
    const err = new InvalidVideoStatusException()
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('InvalidVideoStatusException')
    expect(err.message).toBe('Invalid video status')
  })

  it('deve criar a exceção com mensagem customizada', () => {
    const err = new InvalidVideoStatusException('custom')
    expect(err.message).toBe('custom')
  })
})

describe('VideoNotFoundException', () => {
  it('deve criar a exceção com a mensagem padrão', () => {
    const err = new VideoNotFoundException()
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('VideoNotFoundException')
    expect(err.message).toBe('Video not found')
  })

  it('deve criar a exceção com mensagem customizada', () => {
    const err = new VideoNotFoundException('custom')
    expect(err.message).toBe('custom')
  })
})
