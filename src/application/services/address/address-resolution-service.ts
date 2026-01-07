import { LoadAddressByZipCode, ResolvedAddress } from '@/domain/usecases/load-address-by-zip-code'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'

export class AddressResolutionService implements LoadAddressByZipCode {
  constructor(
    private readonly addressGateway: AddressGateway,
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService,
    private readonly cacheRepository: CacheRepository
  ) { }

  async load(zipCode: string): Promise<ResolvedAddress | null> {
    const cacheKey = `address:resolved:${zipCode}`
    try {
      const cached = await this.cacheRepository.get(cacheKey)
      if (typeof cached === 'string') {
        // We assume valid structure if present in this specific key
        return JSON.parse(cached) as ResolvedAddress
      }
    } catch (_error) {
      // Ignore cache errors
      void _error
    }

    const address = await this.addressGateway.getByZipCode(zipCode)
    if (!address) {
      return null
    }

    const geoIds = await this.getOrCreateGeoEntityService.perform({
      uf: address.state,
      city: address.city,
      neighborhood: address.neighborhood
    })

    const resolvedAddress: ResolvedAddress = {
      ...address,
      stateId: geoIds.stateId.value,
      cityId: geoIds.cityId.value,
      neighborhoodId: geoIds.neighborhoodId.value
    }

    try {
      await this.cacheRepository.set(cacheKey, JSON.stringify(resolvedAddress)) // Default TTL
    } catch (_error) {
      void _error
    }

    return resolvedAddress
  }
}
