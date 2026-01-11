import { LoadCityByIdController } from '@/presentation/controllers/load-city-by-id-controller'
import { Controller } from '@/presentation/protocols/controller'
import { DbLoadCityById } from '@/application/usecases/db-load-city-by-id'
import { CityTypeOrmRepository } from '@/infra/db/typeorm/city-repository'
import { CacheCityRepository } from '@/infra/db/typeorm/cache-city-repository'
import { RedisCacheAdapter } from '@/infra/cache/redis-cache-adapter'

export const makeLoadCityByIdController = (): Controller => {
  const cityRepository = new CityTypeOrmRepository()
  const redisCacheAdapter = new RedisCacheAdapter()
  const cacheCityRepository = new CacheCityRepository(cityRepository, redisCacheAdapter)
  const dbLoadCityById = new DbLoadCityById(cacheCityRepository)
  return new LoadCityByIdController(dbLoadCityById)
}
