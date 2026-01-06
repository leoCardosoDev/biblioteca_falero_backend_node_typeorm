import { CacheRepository } from '@/application/protocols/cache/cache-repository'
import Redis from 'ioredis'
import env from '@/main/config/env'

export class RedisCacheAdapter implements CacheRepository {
  private readonly client: Redis

  constructor() {
    this.client = new Redis(env.redisUrl)
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl)
    } else {
      await this.client.set(key, JSON.stringify(value))
    }
  }

  async get(key: string): Promise<unknown> {
    const value = await this.client.get(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  }
}
