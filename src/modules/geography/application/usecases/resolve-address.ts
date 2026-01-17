import { Either } from '@/shared/application/either'
import { InvalidAddressError } from '@/shared/domain/errors/invalid-address-error'
import { Address } from '@/modules/geography/domain'

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
