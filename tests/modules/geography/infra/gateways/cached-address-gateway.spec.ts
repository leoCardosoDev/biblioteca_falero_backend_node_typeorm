import { AddressDTO, AddressGateway } from '@/shared/domain/gateways/address-gateway'
import { CachedAddressGateway } from '@/shared/infra/gateways/cached-address-gateway'
import { CacheRepository } from '@/modules/geography/application/protocols/cache/cache-repository'

class AddressGatewaySpy implements AddressGateway {
  zipCode = ''
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

class CacheRepositorySpy implements CacheRepository {
  key = ''
  value: unknown = null
  expirationInSeconds = 0
  getReturn: string | null = null
  shouldThrow = false

  async get(key: string): Promise<unknown> {
    this.key = key
    if (this.shouldThrow) throw new Error()
    return this.getReturn
  }

  async set(key: string, value: unknown, expirationInSeconds?: number): Promise<void> {
    this.key = key
    this.value = value
    this.expirationInSeconds = expirationInSeconds || 0
    if (this.shouldThrow) throw new Error()
  }
}

describe('CachedAddressGateway', () => {
  let sut: CachedAddressGateway
  let addressGatewaySpy: AddressGatewaySpy
  let cacheRepositorySpy: CacheRepositorySpy

  beforeEach(() => {
    addressGatewaySpy = new AddressGatewaySpy()
    cacheRepositorySpy = new CacheRepositorySpy()
    sut = new CachedAddressGateway(addressGatewaySpy, cacheRepositorySpy)
  })

  test('Should call CacheRepository.get with correct key', async () => {
    await sut.getByZipCode('any_zip_code')

    expect(cacheRepositorySpy.key).toBe('cep:any_zip_code')
  })

  test('Should return cached value if valid JSON matches AddressDTO', async () => {
    cacheRepositorySpy.getReturn = JSON.stringify({
      zipCode: 'cached_zip',
      street: 'cached_street',
      neighborhood: 'cached_neighborhood',
      city: 'cached_city',
      state: 'cached_state'
    })

    const address = await sut.getByZipCode('any_zip_code')

    expect(address).toEqual({
      zipCode: 'cached_zip',
      street: 'cached_street',
      neighborhood: 'cached_neighborhood',
      city: 'cached_city',
      state: 'cached_state'
    })
  })

  test('Should ignore cache if it is not a string', async () => {
    cacheRepositorySpy.getReturn = null // or any non-string
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should ignore cache if JSON is invalid', async () => {
    cacheRepositorySpy.getReturn = 'invalid_json'
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should ignore cache if schema is invalid', async () => {
    cacheRepositorySpy.getReturn = JSON.stringify({ invalid: 'schema' })
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should ignore cache error (get) and call source', async () => {
    cacheRepositorySpy.shouldThrow = true
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should ignore cache error (set) and return source result', async () => {
    cacheRepositorySpy.shouldThrow = true
    const result = await sut.getByZipCode('any_zip_code')
    expect(result).toEqual(addressGatewaySpy.result)
  })

  test('Should ignore cache if it parses to null', async () => {
    cacheRepositorySpy.getReturn = 'null'
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should ignore cache if it parses to a number', async () => {
    cacheRepositorySpy.getReturn = '123'
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should not cache if source returns null', async () => {
    addressGatewaySpy.result = null
    const result = await sut.getByZipCode('any_zip_code')
    expect(result).toBeNull()
    expect(cacheRepositorySpy.value).toBeNull()
  })

  test('Should call AddressGateway.getByZipCode if cache misses', async () => {
    await sut.getByZipCode('any_zip_code')
    expect(addressGatewaySpy.zipCode).toBe('any_zip_code')
  })

  test('Should set cache with correct TTL on source success', async () => {
    await sut.getByZipCode('any_zip_code')

    expect(cacheRepositorySpy.value).toEqual(JSON.stringify(addressGatewaySpy.result))
    expect(cacheRepositorySpy.expirationInSeconds).toBe(604800)
  })
})
