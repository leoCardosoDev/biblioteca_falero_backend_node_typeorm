import { Either } from '@/shared/either'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'
import { Address } from '@/domain/value-objects/address'

export type ResolveAddressInput = {
  street?: string
  number?: string
  complement?: string
  zipCode: string
  neighborhoodId?: string
  neighborhood?: string
  cityId?: string
  city?: string
  stateId?: string
  state?: string
}

export interface ResolveAddress {
  resolve: (input: ResolveAddressInput) => Promise<Either<InvalidAddressError, Address>>
}
