import { Controller } from '@/presentation/protocols'
import { LoadNeighborhoodByIdController } from '@/presentation/controllers/load-neighborhood-by-id-controller'
import { DbLoadNeighborhoodById } from '@/application/usecases/db-load-neighborhood-by-id'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'

export const makeLoadNeighborhoodByIdController = (): Controller => {
  const neighborhoodRepository = new NeighborhoodTypeOrmRepository()
  const dbLoadNeighborhoodById = new DbLoadNeighborhoodById(neighborhoodRepository)
  return new LoadNeighborhoodByIdController(dbLoadNeighborhoodById)
}
