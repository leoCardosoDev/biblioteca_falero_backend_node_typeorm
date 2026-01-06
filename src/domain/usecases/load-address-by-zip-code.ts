import { AddressDTO } from '@/domain/gateways/address-gateway'

export type ResolvedAddress = AddressDTO & {
  stateId: string
  cityId: string
  neighborhoodId: string
}

export interface LoadAddressByZipCode {
  load: (zipCode: string) => Promise<ResolvedAddress | null>
}
