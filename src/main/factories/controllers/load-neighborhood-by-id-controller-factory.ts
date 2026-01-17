import { Controller } from '@/shared/presentation/protocols'
import { LoadNeighborhoodByIdController } from '@/modules/geography/presentation/controllers/load-neighborhood-by-id-controller'
import { DbLoadNeighborhoodById } from '@/modules/geography/application/usecases/db-load-neighborhood-by-id'
import { NeighborhoodTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/neighborhood-repository'

export const makeLoadNeighborhoodByIdController = (): Controller => {
  const neighborhoodRepository = new NeighborhoodTypeOrmRepository()
  const dbLoadNeighborhoodById = new DbLoadNeighborhoodById(neighborhoodRepository)
  return new LoadNeighborhoodByIdController(dbLoadNeighborhoodById)
}
