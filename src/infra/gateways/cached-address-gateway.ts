import { AddressDTO, AddressGateway } from '@/domain/gateways/address-gateway'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'

export class CachedAddressGateway implements AddressGateway {
  private readonly CACHE_TTL = 60 * 60 * 24 * 7

  constructor(
    private readonly source: AddressGateway,
    private readonly cacheRepository: CacheRepository
  ) { }

  async getByZipCode(zipCode: string): Promise<AddressDTO | null> {
    const key = `cep:${zipCode}`
    try {
      const cached = await this.cacheRepository.get(key)
      if (typeof cached === 'string') {
        const parsed = JSON.parse(cached)
        if (this.isValidAddress(parsed)) {
          return parsed
        }
      }
    } catch (_error) {
      void _error
    }
    const address = await this.source.getByZipCode(zipCode)
    if (address) {
      try {
        await this.cacheRepository.set(key, JSON.stringify(address), this.CACHE_TTL)
      } catch (_error) {
        void _error
      }
    }
    return address
  }

  private isValidAddress(data: unknown): data is AddressDTO {
    if (typeof data !== 'object' || data === null) {
      return false
    }

    const dto = data as Record<string, unknown>
    return (
      typeof dto.zipCode === 'string' &&
      typeof dto.street === 'string' &&
      typeof dto.neighborhood === 'string' &&
      typeof dto.city === 'string' &&
      typeof dto.state === 'string'
    )
  }
}
