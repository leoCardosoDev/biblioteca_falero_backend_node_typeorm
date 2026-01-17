import { LoadCityByIdController } from '@/modules/geography/presentation/controllers/load-city-by-id-controller'
import { Controller } from '@/shared/presentation/protocols'
import { DbLoadCityById } from '@/modules/geography/application/usecases/db-load-city-by-id'
import { CityTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/city-repository'
import { CacheCityRepository } from '@/modules/geography/infra/db/typeorm/repositories/cache-city-repository'
import { RedisCacheAdapter } from '@/shared/infra/cache/redis-cache-adapter'

export const makeLoadCityByIdController = (): Controller => {
  const cityRepository = new CityTypeOrmRepository()
  const redisCacheAdapter = new RedisCacheAdapter()
  const cacheCityRepository = new CacheCityRepository(cityRepository, redisCacheAdapter)
  const dbLoadCityById = new DbLoadCityById(cacheCityRepository)
  return new LoadCityByIdController(dbLoadCityById)
}
