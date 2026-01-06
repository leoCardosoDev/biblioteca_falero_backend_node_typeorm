import { AddressResolutionService } from '@/application/services/address/address-resolution-service'
import { AddressGateway, AddressDTO } from '@/domain/gateways/address-gateway'
import { GetOrCreateGeoEntityService, GeoIdsDTO, AddressDTO as GeoAddressDTO } from '@/domain/services/geo/get-or-create-geo-entity-service'

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
    stateId: 'any_state_id',
    cityId: 'any_city_id',
    neighborhoodId: 'any_neighborhood_id'
  }

  async perform(dto: GeoAddressDTO): Promise<GeoIdsDTO> {
    this.params = dto
    return this.result
  }
}

type SutTypes = {
  sut: AddressResolutionService
  addressGatewaySpy: AddressGatewaySpy
  getOrCreateGeoEntityServiceSpy: GetOrCreateGeoEntityServiceSpy
}

const makeSut = (): SutTypes => {
  const addressGatewaySpy = new AddressGatewaySpy()
  const getOrCreateGeoEntityServiceSpy = new GetOrCreateGeoEntityServiceSpy()
  const sut = new AddressResolutionService(
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy as unknown as GetOrCreateGeoEntityService
  )
  return {
    sut,
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy
  }
}

describe('AddressResolutionService', () => {
  test('Should call AddressGateway with correct zipCode', async () => {
    const { sut, addressGatewaySpy } = makeSut()
    await sut.load('any_zip')
    expect(addressGatewaySpy.zipCode).toBe('any_zip')
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

  test('Should return ResolvedAddress on success', async () => {
    const { sut, addressGatewaySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    const result = await sut.load('any_zip')
    expect(result).toEqual({
      ...addressGatewaySpy.result,
      ...getOrCreateGeoEntityServiceSpy.result
    })
  })

  test('Should throw if GetOrCreateGeoEntityService throws', async () => {
    const { sut, getOrCreateGeoEntityServiceSpy } = makeSut()
    jest.spyOn(getOrCreateGeoEntityServiceSpy, 'perform').mockRejectedValueOnce(new Error())
    const promise = sut.load('any_zip')
    await expect(promise).rejects.toThrow()
  })
})
