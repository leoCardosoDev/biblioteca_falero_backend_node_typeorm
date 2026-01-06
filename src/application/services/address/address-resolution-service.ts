import { LoadAddressByZipCode, ResolvedAddress } from '@/domain/usecases/load-address-by-zip-code'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'

export class AddressResolutionService implements LoadAddressByZipCode {
  constructor(
    private readonly addressGateway: AddressGateway,
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService
  ) { }

  async load(zipCode: string): Promise<ResolvedAddress | null> {
    const address = await this.addressGateway.getByZipCode(zipCode)
    if (!address) {
      return null
    }

    const geoIds = await this.getOrCreateGeoEntityService.perform({
      uf: address.state,
      city: address.city,
      neighborhood: address.neighborhood
    })

    return {
      ...address,
      ...geoIds
    }
  }
}
