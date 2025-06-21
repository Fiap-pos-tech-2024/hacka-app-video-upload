import { RedisCache } from '@adapter/driven/cache/redis-cache'
import Redis from 'ioredis'

jest.mock('ioredis')

describe('RedisCache', () => {
    let redisMock: any
    let cache: RedisCache

    beforeEach(() => {
        redisMock = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn()
        }
        ;(Redis as any).mockImplementation(() => redisMock)
        cache = new RedisCache()
    })

    it('get deve retornar valor deserializado se existir', async () => {
        redisMock.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }))
        const result = await cache.get<{ foo: string }>('key')
        expect(redisMock.get).toHaveBeenCalledWith('key')
        expect(result).toEqual({ foo: 'bar' })
    })

    it('get deve retornar null se não existir', async () => {
        redisMock.get.mockResolvedValue(null)
        const result = await cache.get('key')
        expect(redisMock.get).toHaveBeenCalledWith('key')
        expect(result).toBeNull()
    })

    it('set deve serializar e definir valor com TTL', async () => {
        await cache.set('key', { foo: 'bar' }, 120)
        expect(redisMock.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }), 'EX', 120)
    })

    it('set deve usar TTL padrão se não informado', async () => {
        await cache.set('key', { foo: 'bar' })
        expect(redisMock.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }), 'EX', 60)
    })

    it('del deve remover a chave', async () => {
        await cache.del('key')
        expect(redisMock.del).toHaveBeenCalledWith('key')
    })

    it('deve criar o client Redis com as configs corretas', () => {
        process.env.REDIS_HOST = 'meu-redis'
        process.env.REDIS_PORT = '1234'
        process.env.REDIS_DB = '2'
        new RedisCache()
        expect(Redis).toHaveBeenCalledWith({
            host: 'meu-redis',
            port: 1234,
            db: 2
        })
        delete process.env.REDIS_HOST
        delete process.env.REDIS_PORT
        delete process.env.REDIS_DB
    })

    it('deve criar o client Redis com os valores default', () => {
        delete process.env.REDIS_HOST
        delete process.env.REDIS_PORT
        delete process.env.REDIS_DB
        new RedisCache()
        expect(Redis).toHaveBeenCalledWith({
            host: 'localhost',
            port: 6379,
            db: 0
        })
    })
})
