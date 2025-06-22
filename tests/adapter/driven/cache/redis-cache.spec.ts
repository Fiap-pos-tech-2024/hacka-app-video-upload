import { RedisCache } from '@adapter/driven/cache/redis-cache'
import Redis from 'ioredis'

// Mock explícito da classe Redis
const redisMockInstance = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
}
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => redisMockInstance)
})

describe('RedisCache', () => {
    let cache: RedisCache

    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        redisMockInstance.get.mockReset()
        redisMockInstance.set.mockReset()
        redisMockInstance.del.mockReset()
        cache = new RedisCache()
    })

    it('get deve retornar valor deserializado se existir', async () => {
        redisMockInstance.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }))
        const result = await cache.get<{ foo: string }>('key')
        expect(redisMockInstance.get).toHaveBeenCalledWith('key')
        expect(result).toEqual({ foo: 'bar' })
    })

    it('get deve retornar null se não existir', async () => {
        redisMockInstance.get.mockResolvedValue(null)
        const result = await cache.get('key')
        expect(redisMockInstance.get).toHaveBeenCalledWith('key')
        expect(result).toBeNull()
    })

    it('set deve serializar e definir valor com TTL', async () => {
        await cache.set('key', { foo: 'bar' }, 120)
        expect(redisMockInstance.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }), 'EX', 120)
    })

    it('set deve usar TTL padrão se não informado', async () => {
        await cache.set('key', { foo: 'bar' })
        expect(redisMockInstance.set).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }), 'EX', 60)
    })

    it('del deve remover a chave', async () => {
        await cache.del('key')
        expect(redisMockInstance.del).toHaveBeenCalledWith('key')
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
