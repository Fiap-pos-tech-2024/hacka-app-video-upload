import { ICache } from '@core/application/ports/cache'
import Redis from 'ioredis'

export class RedisCache implements ICache {
    private client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        db: parseInt(process.env.REDIS_DB || '0', 10)
    })

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key)
        return data ? JSON.parse(data) : null
    }

    async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    }

    async del(key: string): Promise<void> {
        await this.client.del(key)
    }
}
