import { AddressDTO } from '@/shared/domain/gateways/address-gateway'
import { Either } from '@/shared/application/either'

export type ResolvedAddress = AddressDTO & {
  stateId: string
  cityId: string
  neighborhoodId: string
}

export interface LoadAddressByZipCode {
  load: (zipCode: string) => Promise<Either<Error, ResolvedAddress>>
}
