import { DbLoadAddressByZipCode } from '@/application/usecases/db-load-address-by-zip-code'
import { ResolvedAddress } from '@/domain/usecases/load-address-by-zip-code'
import { randomUUID } from 'crypto'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { Id } from '@/domain/value-objects/id'
import { NotFoundError } from '@/domain/errors/not-found-error'

const makeSut = () => {
  const addressGatewaySpy = {
    getByZipCode: jest.fn()
  } as unknown as jest.Mocked<AddressGateway>

  const getOrCreateGeoEntityServiceSpy = {
    perform: jest.fn()
  } as unknown as jest.Mocked<GetOrCreateGeoEntityService>

  const sut = new DbLoadAddressByZipCode(
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy
  )

  return {
    sut,
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy
  }
}

describe('DbLoadAddressByZipCode', () => {
  const validZipCode = '12345678'
  const validExternalAddress = {
    zipCode: '12345678',
    street: 'Rua Teste',
    neighborhood: 'Bairro Teste',
    city: 'Cidade Teste',
    state: 'UF'
  }

  it('should call AddressGateway with correct zipCode', async () => {
    const { sut, addressGatewaySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressGatewaySpy.getByZipCode.mockResolvedValue(validExternalAddress)
    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId: Id.create(randomUUID()),
      neighborhoodId: Id.create(randomUUID()),
      stateId: Id.create(randomUUID())
    })

    await sut.load(validZipCode)

    expect(addressGatewaySpy.getByZipCode).toHaveBeenCalledWith(validZipCode)
  })

  it('should return NotFoundError if AddressGateway returns null', async () => {
    const { sut, addressGatewaySpy } = makeSut()
    addressGatewaySpy.getByZipCode.mockResolvedValue(null)

    const result = await sut.load(validZipCode)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should call GetOrCreateGeoEntityService with correct params', async () => {
    const { sut, addressGatewaySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressGatewaySpy.getByZipCode.mockResolvedValue(validExternalAddress)
    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId: Id.create(randomUUID()),
      neighborhoodId: Id.create(randomUUID()),
      stateId: Id.create(randomUUID())
    })

    await sut.load(validZipCode)

    expect(getOrCreateGeoEntityServiceSpy.perform).toHaveBeenCalledWith({
      uf: validExternalAddress.state,
      city: validExternalAddress.city,
      neighborhood: validExternalAddress.neighborhood
    })
  })

  it('should return ResolvedAddress on success', async () => {
    const { sut, addressGatewaySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressGatewaySpy.getByZipCode.mockResolvedValue(validExternalAddress)

    const cityId = Id.create(randomUUID())
    const neighborhoodId = Id.create(randomUUID())
    const stateId = Id.create(randomUUID())

    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId,
      neighborhoodId,
      stateId
    })

    const result = await sut.load(validZipCode)

    expect(result.isRight()).toBe(true)
    const value = result.value as ResolvedAddress
    expect(value.zipCode).toBe(validZipCode)
    expect(value.street).toBe(validExternalAddress.street)
    expect(value.cityId).toBe(cityId.value)
    expect(value.neighborhoodId).toBe(neighborhoodId.value)
    expect(value.stateId).toBe(stateId.value)
  })

  it('should propagate errors from dependencies', async () => {
    const { sut, addressGatewaySpy } = makeSut()
    addressGatewaySpy.getByZipCode.mockRejectedValue(new Error('Gateway error'))

    const promise = sut.load(validZipCode)

    await expect(promise).rejects.toThrow('Gateway error')
  })
})
