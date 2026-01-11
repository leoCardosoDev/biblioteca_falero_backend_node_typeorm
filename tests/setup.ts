
jest.mock('ioredis', () => jest.requireActual('ioredis-mock'))
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'

afterAll(async () => {
  await RedisCacheAdapter.disconnect()
})
