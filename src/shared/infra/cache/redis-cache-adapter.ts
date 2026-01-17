import { CacheRepository } from '@/shared/application/protocols/cache/cache-repository'
import Redis from 'ioredis'
import env from '@/main/config/env'

export class RedisCacheAdapter implements CacheRepository {
  private static client: Redis

  constructor() {
    if (!RedisCacheAdapter.client) {
      RedisCacheAdapter.client = new Redis(env.redisUrl)
    }
  }

  get clientInstance(): Redis {
    return RedisCacheAdapter.client
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (ttl) {
      await this.clientInstance.set(key, JSON.stringify(value), 'EX', ttl)
    } else {
      await this.clientInstance.set(key, JSON.stringify(value))
    }
  }

  async get(key: string): Promise<unknown> {
    const value = await this.clientInstance.get(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = undefined as unknown as Redis
    }
  }
}
