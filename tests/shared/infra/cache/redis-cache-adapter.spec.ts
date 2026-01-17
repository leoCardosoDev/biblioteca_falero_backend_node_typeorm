import type { RedisCacheAdapter as RedisCacheAdapterType } from '@/shared/infra/cache/redis-cache-adapter'
import Redis from 'ioredis'

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn(),
      get: jest.fn(),
      quit: jest.fn()
    }
  })
})

describe('RedisCacheAdapter', () => {
  let sut: RedisCacheAdapterType
  let client: jest.Mocked<Redis>

  beforeEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()

    // Dynamically import to ensure we get a fresh module with the mocked ioredis
    const { RedisCacheAdapter } = await import('@/shared/infra/cache/redis-cache-adapter')

    sut = new RedisCacheAdapter()
    client = sut.clientInstance as jest.Mocked<Redis>
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

  test('Should not create a new Redis client if it is already instantiated', async () => {
    jest.resetModules()
    jest.clearAllMocks()

    // We must re-import mocked redis to get the reference that will be used in the reset module context
    const { default: Redis } = await import('ioredis')
    const { RedisCacheAdapter } = await import('@/shared/infra/cache/redis-cache-adapter')

    // First instantiation - should call Redis
    new RedisCacheAdapter()

    // Second instantiation - should reuse client
    new RedisCacheAdapter()

    expect(Redis).toHaveBeenCalledTimes(1)
  })
})
