import { LoadStateByIdController } from '@/modules/geography/presentation/controllers/load-state-by-id-controller'
import { Controller } from '@/shared/presentation/protocols'
import { DbLoadStateById } from '@/modules/geography/application/usecases/db-load-state-by-id'
import { StateTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/state-repository'
import { CacheStateRepository } from '@/modules/geography/infra/db/typeorm/repositories/cache-state-repository'
import { RedisCacheAdapter } from '@/shared/infra/cache/redis-cache-adapter'

export const makeLoadStateByIdController = (): Controller => {
  const stateRepository = new StateTypeOrmRepository()
  const redisCacheAdapter = new RedisCacheAdapter()
  const cacheStateRepository = new CacheStateRepository(stateRepository, redisCacheAdapter)
  const dbLoadStateById = new DbLoadStateById(cacheStateRepository)
  return new LoadStateByIdController(dbLoadStateById)
}
