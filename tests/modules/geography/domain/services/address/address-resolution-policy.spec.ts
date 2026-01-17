import { DefaultAddressResolutionPolicy, AddressPolicyParams, ResolutionStrategy } from '@/modules/geography/domain/services/address-resolution-policy'

describe('DefaultAddressResolutionPolicy', () => {
  let sut: DefaultAddressResolutionPolicy

  beforeEach(() => {
    sut = new DefaultAddressResolutionPolicy()
  })

  describe('determineStrategy', () => {
    test('Should return USE_PROVIDED_IDS if all IDs are present', () => {
      const params: AddressPolicyParams = {
        cityId: 'any_id',
        neighborhoodId: 'any_id',
        stateId: 'any_id',
        city: 'Any City', // Should prioritize IDs
        zipCode: '12345678'
      }
      expect(sut.determineStrategy(params)).toBe(ResolutionStrategy.USE_PROVIDED_IDS)
    })

    test('Should return LOOKUP_GEO_ENTITIES if IDs are missing and geo names are present', () => {
      const params: AddressPolicyParams = {
        city: 'Any City',
        neighborhood: 'Any Neighborhood',
        state: 'SP',
        zipCode: '12345678' // Should prioritize Geo Entities over ZipCode lookup logic?
        // Logic: if (hasIds) ... return; if (hasGeoNames) ... return; if (zipCode) ... return.
        // So yes, Geo Names > External.
      }
      expect(sut.determineStrategy(params)).toBe(ResolutionStrategy.LOOKUP_GEO_ENTITIES)
    })

    test('Should return LOOKUP_EXTERNAL if IDs and Geo Names are insufficient but ZipCode is present', () => {
      const params: AddressPolicyParams = {
        cityId: 'any_id', // Partial ID
        neighborhood: 'Any Neighborhood', // Partial Name
        zipCode: '12345678'
      }
      expect(sut.determineStrategy(params)).toBe(ResolutionStrategy.LOOKUP_EXTERNAL)
    })

    test('Should return INVALID if insufficient data provided', () => {
      const params: AddressPolicyParams = {
        city: 'Any City'
      }
      expect(sut.determineStrategy(params)).toBe(ResolutionStrategy.INVALID)
    })
  })
})
