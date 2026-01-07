import { AddressResolutionService } from '@/application/services/address/address-resolution-service'
import { AddressGateway, AddressDTO } from '@/domain/gateways/address-gateway'
import { GetOrCreateGeoEntityService, GeoIdsDTO, AddressDTO as GeoAddressDTO } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { Id } from '@/domain/value-objects/id'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'

class AddressGatewaySpy implements AddressGateway {
  zipCode: string | undefined
  result: AddressDTO | null = {
    zipCode: 'any_zip',
    street: 'any_street',
    neighborhood: 'any_neighborhood',
    city: 'any_city',
    state: 'any_state'
  }

  async getByZipCode(zipCode: string): Promise<AddressDTO | null> {
    this.zipCode = zipCode
    return this.result
  }
}

class GetOrCreateGeoEntityServiceSpy {
  params: GeoAddressDTO | undefined
  result: GeoIdsDTO = {
    stateId: { value: 'any_state_id' } as Id,
    cityId: { value: 'any_city_id' } as Id,
    neighborhoodId: { value: 'any_neighborhood_id' } as Id
  }

  async perform(dto: GeoAddressDTO): Promise<GeoIdsDTO> {
    this.params = dto
    return this.result
  }
}

class CacheRepositorySpy {
  key: string | undefined
  value: unknown
  ttl: number | undefined
  result: unknown = null

  async get(key: string): Promise<unknown> {
    this.key = key
    return this.result
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    this.key = key
    this.value = value
    this.ttl = ttl
  }
}

type SutTypes = {
  sut: AddressResolutionService
  addressGatewaySpy: AddressGatewaySpy
  getOrCreateGeoEntityServiceSpy: GetOrCreateGeoEntityServiceSpy
  cacheRepositorySpy: CacheRepositorySpy
}

const makeSut = (): SutTypes => {
  const addressGatewaySpy = new AddressGatewaySpy()
  const getOrCreateGeoEntityServiceSpy = new GetOrCreateGeoEntityServiceSpy()
  const cacheRepositorySpy = new CacheRepositorySpy()
  const sut = new AddressResolutionService(
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy as unknown as GetOrCreateGeoEntityService,
    cacheRepositorySpy as unknown as CacheRepository
  )
  return {
    sut,
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy,
    cacheRepositorySpy
  }
}

describe('AddressResolutionService', () => {
  test('Should call AddressGateway with correct zipCode', async () => {
    const { sut, addressGatewaySpy } = makeSut()
    await sut.load('any_zip')
    expect(addressGatewaySpy.zipCode).toBe('any_zip')
  })

  test('Should check CacheRepository with correct key', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    await sut.load('any_zip')
    expect(cacheRepositorySpy.key).toBe('address:resolved:any_zip')
  })

  test('Should return cached value if present and valid', async () => {
    const { sut, cacheRepositorySpy, addressGatewaySpy } = makeSut()
    const cachedValue = {
      zipCode: 'any_zip',
      stateId: 'cached_id',
      cityId: 'cached_id',
      neighborhoodId: 'cached_id'
    }
    cacheRepositorySpy.result = JSON.stringify(cachedValue)
    const result = await sut.load('any_zip')
    expect(result).toEqual(cachedValue)
    expect(addressGatewaySpy.zipCode).toBeUndefined() // Should NOT call gateway
  })

  test('Should return null if AddressGateway returns null', async () => {
    const { sut, addressGatewaySpy } = makeSut()
    addressGatewaySpy.result = null
    const result = await sut.load('any_zip')
    expect(result).toBeNull()
  })

  test('Should call GetOrCreateGeoEntityService with correct values', async () => {
    const { sut, getOrCreateGeoEntityServiceSpy, addressGatewaySpy } = makeSut()
    addressGatewaySpy.result = {
      zipCode: 'any_zip',
      street: 'any_street',
      neighborhood: 'any_neighborhood',
      city: 'any_city',
      state: 'any_state'
    }
    await sut.load('any_zip')
    expect(getOrCreateGeoEntityServiceSpy.params).toEqual({
      uf: 'any_state',
      city: 'any_city',
      neighborhood: 'any_neighborhood'
    })
  })

  test('Should return ResolvedAddress on success and Cache It', async () => {
    const { sut, addressGatewaySpy, getOrCreateGeoEntityServiceSpy, cacheRepositorySpy } = makeSut()
    const result = await sut.load('any_zip')
    const expected = {
      ...addressGatewaySpy.result,
      stateId: getOrCreateGeoEntityServiceSpy.result.stateId.value,
      cityId: getOrCreateGeoEntityServiceSpy.result.cityId.value,
      neighborhoodId: getOrCreateGeoEntityServiceSpy.result.neighborhoodId.value
    }
    expect(result).toEqual(expected)
    expect(cacheRepositorySpy.key).toBe('address:resolved:any_zip')
    expect(JSON.parse(cacheRepositorySpy.value as string)).toEqual(expected)
  })

  test('Should throw if GetOrCreateGeoEntityService throws', async () => {
    const { sut, getOrCreateGeoEntityServiceSpy } = makeSut()
    jest.spyOn(getOrCreateGeoEntityServiceSpy, 'perform').mockRejectedValueOnce(new Error())
    const promise = sut.load('any_zip')
    await expect(promise).rejects.toThrow()
  })

  test('Should ignore cache errors on get', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    jest.spyOn(cacheRepositorySpy, 'get').mockRejectedValueOnce(new Error())
    const result = await sut.load('any_zip')
    expect(result).toBeTruthy()
    expect(cacheRepositorySpy.key).toBe('address:resolved:any_zip')
  })

  test('Should ignore cache errors on set', async () => {
    const { sut, cacheRepositorySpy } = makeSut()
    jest.spyOn(cacheRepositorySpy, 'set').mockRejectedValueOnce(new Error())
    const result = await sut.load('any_zip')
    expect(result).toBeTruthy()
    expect(cacheRepositorySpy.key).toBe('address:resolved:any_zip')
  })
})
