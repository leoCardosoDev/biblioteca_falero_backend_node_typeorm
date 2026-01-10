import { CacheStateRepository } from '@/infra/db/typeorm/cache-state-repository'
import { LoadStateByIdRepository } from '@/application/protocols/db/state/load-state-by-id-repository'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'
import { StateModel } from '@/domain/models/state'
import { Id } from '@/domain/value-objects/id'
import crypto from 'crypto'

class LoadStateByIdRepositorySpy implements LoadStateByIdRepository {
  id?: string
  result?: StateModel = {
    id: Id.create(crypto.randomUUID()) as Id,
    name: 'any_name',
    uf: 'UF'
  }

  async loadById(id: string): Promise<StateModel | undefined> {
    this.id = id
    return this.result
  }
}

class CacheRepositorySpy implements CacheRepository {
  key?: string
  value?: unknown
  ttl?: number
  getResult?: unknown = null

  async get(key: string): Promise<unknown> {
    this.key = key
    return this.getResult
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    this.key = key
    this.value = value
    this.ttl = ttl
  }
}

type SutTypes = {
  sut: CacheStateRepository
  loadStateByIdRepositorySpy: LoadStateByIdRepositorySpy
  cacheRepositorySpy: CacheRepositorySpy
}

const makeSut = (): SutTypes => {
  const loadStateByIdRepositorySpy = new LoadStateByIdRepositorySpy()
  const cacheRepositorySpy = new CacheRepositorySpy()
  const sut = new CacheStateRepository(loadStateByIdRepositorySpy, cacheRepositorySpy)
  return {
    sut,
    loadStateByIdRepositorySpy,
    cacheRepositorySpy
  }
}

describe('CacheStateRepository', () => {
  test('Should call CacheRepository.get with correct key', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(cacheRepositorySpy.key).toBe(`state:${id}`)
  })

  test('Should return cached value if CacheRepository.get returns value', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    const state = {
      id: Id.create(crypto.randomUUID()) as Id,
      name: 'any_name',
      uf: 'UF'
    }
    cacheRepositorySpy.getResult = state
    const id = crypto.randomUUID()
    const result = await sut.loadById(id)
    expect(result).toEqual(state)
  })

  test('Should call LoadStateByIdRepository if CacheRepository.get returns null', async () => {
    const { sut, loadStateByIdRepositorySpy } = makeSut()
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(loadStateByIdRepositorySpy.id).toBe(id)
  })

  test('Should call CacheRepository.set if LoadStateByIdRepository returns a state', async () => {
    const { sut, loadStateByIdRepositorySpy, cacheRepositorySpy } = makeSut()
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(cacheRepositorySpy.key).toBe(`state:${id}`)
    expect(cacheRepositorySpy.value).toEqual(loadStateByIdRepositorySpy.result)
    expect(cacheRepositorySpy.ttl).toBe(2592000) // 30 days
  })

  test('Should not call CacheRepository.set if LoadStateByIdRepository returns undefined', async () => {
    const { sut, loadStateByIdRepositorySpy, cacheRepositorySpy } = makeSut()
    loadStateByIdRepositorySpy.result = undefined
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(cacheRepositorySpy.value).toBeUndefined()
  })

  test('Should return undefined if LoadStateByIdRepository returns undefined', async () => {
    const { sut, loadStateByIdRepositorySpy } = makeSut()
    loadStateByIdRepositorySpy.result = undefined
    const id = crypto.randomUUID()
    const result = await sut.loadById(id)
    expect(result).toBeUndefined()
  })
})
