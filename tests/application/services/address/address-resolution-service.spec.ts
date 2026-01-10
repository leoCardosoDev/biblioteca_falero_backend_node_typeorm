import { AddressResolutionService } from '@/application/services/address/address-resolution-service'
import { GetOrCreateGeoEntityService, GeoIdsDTO } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { Id } from '@/domain/value-objects/id'
import { AddUserParams } from '@/domain/usecases/add-user'
import { AddressGateway, AddressDTO } from '@/domain/gateways/address-gateway'
import { Address } from '@/domain/value-objects/address'

const makeGetOrCreateGeoEntityService = (): GetOrCreateGeoEntityService => {
  class GetOrCreateGeoEntityServiceStub {
    async perform(_dto: AddressDTO): Promise<GeoIdsDTO> {
      return Promise.resolve({
        stateId: Id.create('550e8400-e29b-41d4-a716-446655440001'),
        cityId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
        neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440003')
      })
    }
  }
  return new GetOrCreateGeoEntityServiceStub() as unknown as GetOrCreateGeoEntityService
}

const makeAddressGateway = (): AddressGateway => {
  class AddressGatewayStub implements AddressGateway {
    async getByZipCode(zipCode: string): Promise<AddressDTO | null> {
      return Promise.resolve({
        zipCode,
        street: 'any_street_external',
        neighborhood: 'any_neighborhood_external',
        city: 'any_city_external',
        state: 'SP'
      })
    }
  }
  return new AddressGatewayStub()
}

interface SutTypes {
  sut: AddressResolutionService
  getOrCreateGeoEntityServiceStub: GetOrCreateGeoEntityService
  addressGatewayStub: AddressGateway
}

const makeSut = (): SutTypes => {
  const getOrCreateGeoEntityServiceStub = makeGetOrCreateGeoEntityService()
  const addressGatewayStub = makeAddressGateway()
  const sut = new AddressResolutionService(getOrCreateGeoEntityServiceStub, addressGatewayStub)
  return {
    sut,
    getOrCreateGeoEntityServiceStub,
    addressGatewayStub
  }
}

const makeFakeAddressData = (): AddUserParams['address'] => ({
  street: 'any_street',
  number: '123',
  zipCode: '12345678',
  cityId: '550e8400-e29b-41d4-a716-446655440002',
  neighborhoodId: '550e8400-e29b-41d4-a716-446655440003',
  stateId: '550e8400-e29b-41d4-a716-446655440001'
})

describe('AddressResolutionService', () => {
  describe('resolve', () => {
    test('Should return undefined if addressData is null/undefined', async () => {
      const { sut } = makeSut()
      const response = await sut.resolve(undefined)
      expect(response).toBeUndefined()
    })

    test('Should return Address if valid IDs are provided', async () => {
      const { sut } = makeSut()
      const response = await sut.resolve(makeFakeAddressData())
      expect(response).not.toBeInstanceOf(Error)
      expect(response).toHaveProperty('street')
      expect(response).toHaveProperty('cityId')
    })

    test('Should return InvalidAddressError if IDs are missing and not resolved', async () => {
      const { sut, addressGatewayStub } = makeSut()
      // Mock gateway to return null, forcing failure if no geo names are present
      jest.spyOn(addressGatewayStub, 'getByZipCode').mockResolvedValueOnce(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addressData: any = makeFakeAddressData()
      delete addressData.cityId
      delete addressData.zipCode // ensure external lookup doesn't happen/isn't passed

      const response = await sut.resolve(addressData)
      expect(response).toBeInstanceOf(Error)
      expect((response as Error).message).toContain('city is required')
    })

    test('Should call GetOrCreateGeoEntityService if address has names but no IDs', async () => {
      const { sut, getOrCreateGeoEntityServiceStub } = makeSut()
      const performSpy = jest.spyOn(getOrCreateGeoEntityServiceStub, 'perform')
      const addressData = {
        street: 'any_street',
        number: '123',
        zipCode: '12345678',
        city: 'any_city',
        neighborhood: 'any_neighborhood',
        state: 'SP'
      }
      await sut.resolve(addressData)
      expect(performSpy).toHaveBeenCalledWith({
        uf: 'SP',
        city: 'any_city',
        neighborhood: 'any_neighborhood'
      })
    })

    test('Should call AddressGateway if no IDs and no Names, but ZipCode provided', async () => {
      const { sut, addressGatewayStub, getOrCreateGeoEntityServiceStub } = makeSut()
      const getByZipCodeSpy = jest.spyOn(addressGatewayStub, 'getByZipCode')
      const performSpy = jest.spyOn(getOrCreateGeoEntityServiceStub, 'perform')

      const addressData = {
        zipCode: '87654321',
        number: '100'
      } as unknown as AddUserParams['address']

      await sut.resolve(addressData)

      expect(getByZipCodeSpy).toHaveBeenCalledWith('87654321')
      expect(performSpy).toHaveBeenCalledWith({
        uf: 'SP',
        city: 'any_city_external',
        neighborhood: 'any_neighborhood_external'
      })
    })

    test('Should return correct Address after external lookup', async () => {
      const { sut } = makeSut()
      const addressData = {
        zipCode: '87654321',
        number: '100'
      } as unknown as AddUserParams['address']

      const response = await sut.resolve(addressData) as Address
      expect(response).not.toBeInstanceOf(Error)
      expect(response.street).toBe('any_street_external')
      expect(response.zipCode).toBe('87654321')
    })

    test('Should return invalid address error if external lookup fails (returns null)', async () => {
      const { sut, addressGatewayStub } = makeSut()
      jest.spyOn(addressGatewayStub, 'getByZipCode').mockResolvedValueOnce(null)

      const addressData = {
        zipCode: '99999999',
        number: '100'
      } as unknown as AddUserParams['address']

      const response = await sut.resolve(addressData)
      expect(response).toBeInstanceOf(Error)
    })

    test('Should not overwrite street and complement if already provided', async () => {
      const { sut, addressGatewayStub, getOrCreateGeoEntityServiceStub } = makeSut()
      jest.spyOn(addressGatewayStub, 'getByZipCode')
      jest.spyOn(getOrCreateGeoEntityServiceStub, 'perform')

      const addressData = {
        zipCode: '87654321',
        number: '100',
        street: 'User Provided Street',
        complement: 'User Provided Complement'
      } as unknown as AddUserParams['address']

      const response = await sut.resolve(addressData) as Address

      expect(response).not.toBeInstanceOf(Error)
      expect(response.street).toBe('User Provided Street')
      expect(response.complement).toBe('User Provided Complement')
      // Should still resolve IDs
      expect(response.cityId.value).toBe('550e8400-e29b-41d4-a716-446655440002')
    })

    test('Should return InvalidAddressError if neighborhoodId is missing', async () => {
      const { sut, addressGatewayStub } = makeSut()
      jest.spyOn(addressGatewayStub, 'getByZipCode').mockResolvedValueOnce(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addressData: any = makeFakeAddressData()
      delete addressData.neighborhoodId
      delete addressData.zipCode

      const response = await sut.resolve(addressData)
      expect(response).toBeInstanceOf(Error)
      expect((response as Error).message).toContain('neighborhood is required')
    })

    test('Should return InvalidAddressError if stateId is missing', async () => {
      const { sut, addressGatewayStub } = makeSut()
      jest.spyOn(addressGatewayStub, 'getByZipCode').mockResolvedValueOnce(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addressData: any = makeFakeAddressData()
      delete addressData.stateId
      delete addressData.zipCode

      const response = await sut.resolve(addressData)
      expect(response).toBeInstanceOf(Error)
      expect((response as Error).message).toContain('state is required')
    })
  })

  describe('load (LoadAddressByZipCode)', () => {
    test('Should return null if gateway returns null', async () => {
      const { sut, addressGatewayStub } = makeSut()
      jest.spyOn(addressGatewayStub, 'getByZipCode').mockResolvedValueOnce(null)
      const response = await sut.load('invalid_zip')
      expect(response).toBeNull()
    })

    test('Should return ResolvedAddress with IDs on success', async () => {
      const { sut } = makeSut()
      const response = await sut.load('valid_zip')
      expect(response).toEqual({
        zipCode: 'valid_zip',
        street: 'any_street_external',
        neighborhood: 'any_neighborhood_external',
        city: 'any_city_external',
        state: 'SP',
        stateId: '550e8400-e29b-41d4-a716-446655440001',
        cityId: '550e8400-e29b-41d4-a716-446655440002',
        neighborhoodId: '550e8400-e29b-41d4-a716-446655440003'
      })
    })
  })
})
