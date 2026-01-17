export type AddressPolicyParams = {
  cityId?: string
  neighborhoodId?: string
  stateId?: string
  city?: string
  neighborhood?: string
  state?: string
  zipCode?: string
}

export enum ResolutionStrategy {
  USE_PROVIDED_IDS = 'USE_PROVIDED_IDS',
  LOOKUP_GEO_ENTITIES = 'LOOKUP_GEO_ENTITIES',
  LOOKUP_EXTERNAL = 'LOOKUP_EXTERNAL',
  INVALID = 'INVALID'
}

export interface AddressResolutionPolicy {
  determineStrategy(params: AddressPolicyParams): ResolutionStrategy
}

export class DefaultAddressResolutionPolicy implements AddressResolutionPolicy {
  determineStrategy(params: AddressPolicyParams): ResolutionStrategy {
    const hasIds = !!(params.cityId && params.neighborhoodId && params.stateId)
    if (hasIds) {
      return ResolutionStrategy.USE_PROVIDED_IDS
    }

    const hasGeoNames = !!(params.city && params.neighborhood && params.state)
    if (hasGeoNames) {
      return ResolutionStrategy.LOOKUP_GEO_ENTITIES
    }

    if (params.zipCode) {
      return ResolutionStrategy.LOOKUP_EXTERNAL
    }

    return ResolutionStrategy.INVALID
  }
}
