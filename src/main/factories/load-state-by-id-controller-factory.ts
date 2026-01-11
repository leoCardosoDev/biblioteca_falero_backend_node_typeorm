import { LoadStateByIdController } from '@/presentation/controllers/load-state-by-id-controller'
import { Controller } from '@/presentation/protocols/controller'
import { DbLoadStateById } from '@/application/usecases/db-load-state-by-id'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { CacheStateRepository } from '@/infra/db/typeorm/cache-state-repository'
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'

export const makeLoadStateByIdController = (): Controller => {
  const stateRepository = new StateTypeOrmRepository()
  const redisCacheAdapter = new RedisCacheAdapter()
  const cacheStateRepository = new CacheStateRepository(stateRepository, redisCacheAdapter)
  const dbLoadStateById = new DbLoadStateById(cacheStateRepository)
  return new LoadStateByIdController(dbLoadStateById)
}
