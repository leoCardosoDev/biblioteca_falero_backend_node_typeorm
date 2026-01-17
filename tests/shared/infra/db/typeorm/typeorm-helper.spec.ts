import { DataSource, DataSourceOptions, EntityTarget, ObjectLiteral } from 'typeorm'

import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'

jest.mock('typeorm', () => {
  return {
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn(),
      destroy: jest.fn(),
      getRepository: jest.fn()
    }))
  }
})

describe('TypeOrmHelper', () => {
  let initializeSpy: jest.Mock
  let destroySpy: jest.Mock
  let getRepositorySpy: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()
    initializeSpy = jest.fn()
    destroySpy = jest.fn()
    getRepositorySpy = jest.fn()
      ; (DataSource as jest.Mock).mockImplementation(() => ({
        initialize: initializeSpy,
        destroy: destroySpy,
        getRepository: getRepositorySpy
      }))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('connect', () => {
    test('Should call DataSource.initialize once if success', async () => {
      initializeSpy.mockResolvedValueOnce(undefined)
      await TypeOrmHelper.connect({} as DataSourceOptions)
      expect(initializeSpy).toHaveBeenCalledTimes(1)
    })

    test('Should return the client if success', async () => {
      initializeSpy.mockResolvedValueOnce(undefined)
      const client = await TypeOrmHelper.connect({} as DataSourceOptions)
      expect(client).toBeTruthy()
    })

    test('Should retry connection if initialize fails', async () => {
      initializeSpy
        .mockRejectedValueOnce(new Error())
        .mockResolvedValueOnce(undefined)

      const promise = TypeOrmHelper.connect({} as DataSourceOptions, 3, 1000)

      await jest.advanceTimersByTimeAsync(2000)

      await promise
      expect(initializeSpy).toHaveBeenCalledTimes(2)
    })

    test('Should fail if max retries reached', async () => {
      const error = new Error('Connection failed')
      initializeSpy.mockRejectedValue(error)

      const promise = TypeOrmHelper.connect({} as DataSourceOptions, 2, 1000)
        .catch((e: Error) => e)

      await jest.advanceTimersByTimeAsync(2000)

      const result = await promise
      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe('Connection failed')
      expect(initializeSpy).toHaveBeenCalledTimes(2)
    })

    test('Should throw error if retries is 0 (loop skipped)', async () => {
      const promise = TypeOrmHelper.connect({} as DataSourceOptions, 0)
      await expect(promise).rejects.toThrow(new Error('Failed to connect to database'))
    })

    test('Should return client after loop completes', async () => {
      initializeSpy.mockResolvedValueOnce(undefined)
      const client = await TypeOrmHelper.connect({} as DataSourceOptions, 1, 1000)
      expect(client).toBe(TypeOrmHelper.client)
    })
  })

  describe('disconnect', () => {
    test('Should call destroy', async () => {
      initializeSpy.mockResolvedValueOnce(undefined)
      await TypeOrmHelper.connect({} as DataSourceOptions)
      await TypeOrmHelper.disconnect()
      expect(destroySpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('getRepository', () => {
    test('Should call client.getRepository', async () => {
      initializeSpy.mockResolvedValueOnce(undefined)
      await TypeOrmHelper.connect({} as DataSourceOptions)
      TypeOrmHelper.getRepository('any_entity' as unknown as EntityTarget<ObjectLiteral>)
      expect(getRepositorySpy).toHaveBeenCalledWith('any_entity')
    })
  })
})
