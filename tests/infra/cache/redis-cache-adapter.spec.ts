import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'
import Redis from 'ioredis'

jest.mock('ioredis')

describe('RedisCacheAdapter', () => {
  let sut: RedisCacheAdapter
  let client: jest.Mocked<Redis>

  beforeEach(() => {
    (Redis as unknown as jest.Mock).mockClear()
    sut = new RedisCacheAdapter()
    client = (Redis as unknown as jest.Mock).mock.instances[0] as jest.Mocked<Redis>
  })

  describe('set()', () => {
    test('Should call Redis.set with correct values', async () => {
      const key = 'any_key'
      const value = { any: 'value' }
      await sut.set(key, value)
      expect(client.set).toHaveBeenCalledWith(key, JSON.stringify(value))
    })

    test('Should call Redis.set with EX and ttl if ttl is provided', async () => {
      const key = 'any_key'
      const value = { any: 'value' }
      const ttl = 100
      await sut.set(key, value, ttl)
      expect(client.set).toHaveBeenCalledWith(key, JSON.stringify(value), 'EX', ttl)
    })
  })

  describe('get()', () => {
    test('Should call Redis.get with correct key', async () => {
      const key = 'any_key'
      await sut.get(key)
      expect(client.get).toHaveBeenCalledWith(key)
    })

    test('Should return value on success', async () => {
      const key = 'any_key'
      const value = { any: 'value' }
      client.get.mockResolvedValueOnce(JSON.stringify(value))
      const result = await sut.get(key)
      expect(result).toEqual(value)
    })

    test('Should return null if Redis.get returns null', async () => {
      const key = 'any_key'
      client.get.mockResolvedValueOnce(null)
      const result = await sut.get(key)
      expect(result).toBeNull()
    })
  })
})
