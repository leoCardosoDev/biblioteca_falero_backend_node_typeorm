import { CacheCityRepository } from '@/infra/db/typeorm/cache-city-repository'
import { LoadCityByIdRepository } from '@/application/protocols/db/city/load-city-by-id-repository'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'
import { CityModel } from '@/domain/models/city'
import { Id } from '@/domain/value-objects/id'
import crypto from 'crypto'

class LoadCityByIdRepositorySpy implements LoadCityByIdRepository {
  id?: string
  result?: CityModel = {
    id: Id.create(crypto.randomUUID()) as Id,
    name: 'any_name',
    stateId: Id.create(crypto.randomUUID()) as Id
  }

  async loadById(id: string): Promise<CityModel | undefined> {
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
  sut: CacheCityRepository
  loadCityByIdRepositorySpy: LoadCityByIdRepositorySpy
  cacheRepositorySpy: CacheRepositorySpy
}

const makeSut = (): SutTypes => {
  const loadCityByIdRepositorySpy = new LoadCityByIdRepositorySpy()
  const cacheRepositorySpy = new CacheRepositorySpy()
  const sut = new CacheCityRepository(loadCityByIdRepositorySpy, cacheRepositorySpy)
  return {
    sut,
    loadCityByIdRepositorySpy,
    cacheRepositorySpy
  }
}

describe('CacheCityRepository', () => {
  test('Should call CacheRepository.get with correct key', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(cacheRepositorySpy.key).toBe(`city:${id}`)
  })

  test('Should return cached value if CacheRepository.get returns value', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    const city = {
      id: Id.create(crypto.randomUUID()) as Id,
      name: 'any_name',
      stateId: Id.create(crypto.randomUUID()) as Id
    }
    cacheRepositorySpy.getResult = city
    const id = crypto.randomUUID()
    const result = await sut.loadById(id)
    expect(result).toEqual(city)
  })

  test('Should call LoadCityByIdRepository if CacheRepository.get returns null', async () => {
    const { sut, loadCityByIdRepositorySpy } = makeSut()
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(loadCityByIdRepositorySpy.id).toBe(id)
  })

  test('Should call CacheRepository.set if LoadCityByIdRepository returns a city', async () => {
    const { sut, loadCityByIdRepositorySpy, cacheRepositorySpy } = makeSut()
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(cacheRepositorySpy.key).toBe(`city:${id}`)
    expect(cacheRepositorySpy.value).toEqual(loadCityByIdRepositorySpy.result)
    expect(cacheRepositorySpy.ttl).toBe(2592000) // 30 days
  })

  test('Should not call CacheRepository.set if LoadCityByIdRepository returns undefined', async () => {
    const { sut, loadCityByIdRepositorySpy, cacheRepositorySpy } = makeSut()
    loadCityByIdRepositorySpy.result = undefined
    const id = crypto.randomUUID()
    await sut.loadById(id)
    expect(cacheRepositorySpy.value).toBeUndefined()
  })

  test('Should return undefined if LoadCityByIdRepository returns undefined', async () => {
    const { sut, loadCityByIdRepositorySpy } = makeSut()
    loadCityByIdRepositorySpy.result = undefined
    const id = crypto.randomUUID()
    const result = await sut.loadById(id)
    expect(result).toBeUndefined()
  })
})
