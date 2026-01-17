import { LoadStateByIdRepository } from '@/modules/geography/application/protocols/db/state/load-state-by-id-repository'
import { CacheRepository } from '@/shared/application/protocols/cache/cache-repository'
import { StateModel } from '@/modules/geography/domain/models/state'

export class CacheStateRepository implements LoadStateByIdRepository {
  constructor(
    private readonly decoratee: LoadStateByIdRepository,
    private readonly cacheRepository: CacheRepository
  ) { }

  async loadById(id: string): Promise<StateModel | undefined> {
    const cacheKey = `state:${id}`
    const cached = await this.cacheRepository.get(cacheKey)
    if (cached) {
      return cached as StateModel
    }

    const state = await this.decoratee.loadById(id)
    if (state) {
      const CACHE_TTL_30_DAYS = 60 * 60 * 24 * 30
      await this.cacheRepository.set(cacheKey, state, CACHE_TTL_30_DAYS)
    }
    return state
  }
}
