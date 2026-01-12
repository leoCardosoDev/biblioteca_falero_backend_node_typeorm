import { LoadCityByIdRepository } from '@/application/protocols/db/city/load-city-by-id-repository'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'
import { CityModel } from '@/domain/models/city'

export class CacheCityRepository implements LoadCityByIdRepository {
  constructor(
    private readonly decoratee: LoadCityByIdRepository,
    private readonly cacheRepository: CacheRepository
  ) { }

  async loadById(id: string): Promise<CityModel | undefined> {
    const cacheKey = `city:${id}`
    const cached = await this.cacheRepository.get(cacheKey)
    if (cached) {
      return cached as CityModel
    }

    const city = await this.decoratee.loadById(id)
    if (city) {
      const CACHE_TTL_30_DAYS = 60 * 60 * 24 * 30
      await this.cacheRepository.set(cacheKey, city, CACHE_TTL_30_DAYS)
    }
    return city
  }
}
