import { LoadStateByIdRepository } from '@/application/protocols/db/state/load-state-by-id-repository'
import { CacheRepository } from '@/application/protocols/cache/cache-repository'
import { StateModel } from '@/domain/models/state'

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
      await this.cacheRepository.set(cacheKey, state, 60 * 60 * 24 * 30) // 30 days
    }
    return state
  }
}
