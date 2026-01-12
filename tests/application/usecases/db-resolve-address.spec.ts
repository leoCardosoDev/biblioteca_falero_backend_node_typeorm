import { DbResolveAddress } from '@/application/usecases/db-resolve-address'
import { randomUUID } from 'crypto'
import { AddressResolutionPolicy, ResolutionStrategy } from '@/domain/services/address/address-resolution-policy'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { ResolveAddressInput } from '@/domain/usecases/resolve-address'
import { Id } from '@/domain/value-objects/id'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'
import { Address } from '@/domain/value-objects/address'

const makeSut = () => {
  const addressResolutionPolicySpy = {
    determineStrategy: jest.fn()
  } as unknown as jest.Mocked<AddressResolutionPolicy>

  const addressGatewaySpy = {
    getByZipCode: jest.fn()
  } as unknown as jest.Mocked<AddressGateway>

  const getOrCreateGeoEntityServiceSpy = {
    perform: jest.fn()
  } as unknown as jest.Mocked<GetOrCreateGeoEntityService>

  const sut = new DbResolveAddress(
    addressResolutionPolicySpy,
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy
  )

  return {
    sut,
    addressResolutionPolicySpy,
    addressGatewaySpy,
    getOrCreateGeoEntityServiceSpy
  }
}

describe('DbResolveAddress', () => {
  const validIdsInput: ResolveAddressInput = {
    zipCode: '12345678',
    street: 'Rua Teste',
    number: '123',
    cityId: randomUUID(),
    neighborhoodId: randomUUID(),
    stateId: randomUUID()
  }

  const validGeoInput: ResolveAddressInput = {
    zipCode: '12345678',
    street: 'Rua Teste',
    number: '123',
    city: 'City Name',
    neighborhood: 'Neighborhood Name',
    state: 'ST'
  }

  it('should call AddressResolutionPolicy with correct params', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.INVALID)

    await sut.resolve(validIdsInput)

    expect(addressResolutionPolicySpy.determineStrategy).toHaveBeenCalledWith(expect.objectContaining({
      zipCode: validIdsInput.zipCode,
      cityId: validIdsInput.cityId,
      neighborhoodId: validIdsInput.neighborhoodId,
      stateId: validIdsInput.stateId
    }))
  })

  it('should return InvalidAddressError if strategy is INVALID', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.INVALID)

    const result = await sut.resolve(validIdsInput)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAddressError)
  })

  it('should resolve using provided IDs if strategy is USE_PROVIDED_IDS', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.USE_PROVIDED_IDS)

    const result = await sut.resolve(validIdsInput)

    expect(result.isRight()).toBe(true)
    const address = result.value as Address
    expect(address.cityId.value).toBe(validIdsInput.cityId)
    expect(address.neighborhoodId.value).toBe(validIdsInput.neighborhoodId)
    expect(address.stateId.value).toBe(validIdsInput.stateId)
  })

  it('should resolve using GeoEntities if strategy is LOOKUP_GEO_ENTITIES', async () => {
    const { sut, addressResolutionPolicySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_GEO_ENTITIES)

    const cityId = Id.create(randomUUID())
    const neighborhoodId = Id.create(randomUUID())
    const stateId = Id.create(randomUUID())

    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId,
      neighborhoodId,
      stateId
    })

    const result = await sut.resolve(validGeoInput)

    expect(result.isRight()).toBe(true)
    const address = result.value as Address
    expect(address.cityId.value).toBe(cityId.value)
    expect(getOrCreateGeoEntityServiceSpy.perform).toHaveBeenCalledWith({
      uf: validGeoInput.state,
      city: validGeoInput.city,
      neighborhood: validGeoInput.neighborhood
    })
  })

  it('should resolve using External Gateway if strategy is LOOKUP_EXTERNAL', async () => {
    const { sut, addressResolutionPolicySpy, addressGatewaySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_EXTERNAL)

    const cityId = Id.create(randomUUID())
    const neighborhoodId = Id.create(randomUUID())
    const stateId = Id.create(randomUUID())

    addressGatewaySpy.getByZipCode.mockResolvedValue({
      zipCode: '12345678',
      street: 'Street From API',
      neighborhood: 'Neighborhood From API',
      city: 'City From API',
      state: 'UF'
    })

    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId,
      neighborhoodId,
      stateId
    })

    const result = await sut.resolve({ ...validIdsInput, street: undefined })

    expect(result.isRight()).toBe(true)
    const address = result.value as Address
    expect(address.street).toBe('Street From API')
    expect(address.cityId.value).toBe(cityId.value)
  })

  it('should return InvalidAddressError if External Gateway fails to find address', async () => {
    const { sut, addressResolutionPolicySpy, addressGatewaySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_EXTERNAL)

    addressGatewaySpy.getByZipCode.mockResolvedValue(null)

    const result = await sut.resolve(validIdsInput)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new InvalidAddressError('Address not found for the provided ZipCode'))
  })
  it('should return InvalidAddressError if strategy is LOOKUP_EXTERNAL but no zipCode is provided', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_EXTERNAL)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sut.resolve({ ...validIdsInput, zipCode: undefined } as any)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new InvalidAddressError('ZipCode required for external lookup'))
  })

  it('should return InvalidAddressError if strategy is USE_PROVIDED_IDS but IDs are missing', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.USE_PROVIDED_IDS)

    const result = await sut.resolve({ ...validIdsInput, cityId: undefined })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new InvalidAddressError('Missing required IDs despite strategy'))
  })

  it('should return InvalidAddressError if GeoEntities lookup fails to return all IDs', async () => {
    const { sut, addressResolutionPolicySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_GEO_ENTITIES)

    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId: undefined as unknown as Id,
      neighborhoodId: Id.create(randomUUID()),
      stateId: Id.create(randomUUID())
    })

    const result = await sut.resolve(validGeoInput)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new InvalidAddressError('Failed to resolve address IDs'))
  })

  it('should return InvalidAddressError if Address.create fails', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.USE_PROVIDED_IDS)

    jest.spyOn(Address, 'create').mockReturnValueOnce(new Error('Address creation error'))

    const result = await sut.resolve(validIdsInput)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(Error)
  })

  it('should pass empty string for street/number if undefined (USE_PROVIDED_IDS)', async () => {
    const { sut, addressResolutionPolicySpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.USE_PROVIDED_IDS)

    // Spy to verify arguments passed to Address.create
    const createSpy = jest.spyOn(Address, 'create')

    const input = { ...validIdsInput, street: undefined, number: undefined }
    await sut.resolve(input)

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      street: '',
      number: ''
    }))
  })

  it('should pass empty string for street/number if undefined (LOOKUP_GEO_ENTITIES)', async () => {
    const { sut, addressResolutionPolicySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_GEO_ENTITIES)

    const cityId = Id.create(randomUUID())
    const neighborhoodId = Id.create(randomUUID())
    const stateId = Id.create(randomUUID())

    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId,
      neighborhoodId,
      stateId
    })

    const createSpy = jest.spyOn(Address, 'create')

    const input = { ...validGeoInput, street: undefined, number: undefined }
    await sut.resolve(input)

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      street: '',
      number: ''
    }))
  })

  it('should return Left if Address.create fails in final step (after resolution)', async () => {
    const { sut, addressResolutionPolicySpy, getOrCreateGeoEntityServiceSpy } = makeSut()
    addressResolutionPolicySpy.determineStrategy.mockReturnValue(ResolutionStrategy.LOOKUP_GEO_ENTITIES)

    getOrCreateGeoEntityServiceSpy.perform.mockResolvedValue({
      cityId: Id.create(randomUUID()),
      neighborhoodId: Id.create(randomUUID()),
      stateId: Id.create(randomUUID())
    })

    // Force Address.create to fail (e.g. by emptiness which we confirmed earlier)
    // Or just spyMock
    jest.spyOn(Address, 'create').mockReturnValue(new Error('Final step error'))

    const result = await sut.resolve(validGeoInput)

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(Error)
    expect((result.value as Error).message).toBe('Final step error')
  })
})
