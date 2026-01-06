import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'

afterAll(async () => {
  await RedisCacheAdapter.disconnect()
})
