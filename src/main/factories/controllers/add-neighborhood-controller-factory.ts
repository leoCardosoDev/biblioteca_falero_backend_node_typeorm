import { AddNeighborhoodController } from '@/presentation/controllers/add-neighborhood-controller'
import { DbAddNeighborhood } from '@/application/usecases/db-add-neighborhood'
import { NeighborhoodTypeOrmRepository } from '@/infra/db/typeorm/neighborhood-repository'
import { Controller } from '@/presentation/protocols'
import { ZodAddNeighborhoodValidator } from '@/infra/validators/zod-add-neighborhood-validation'

export const makeAddNeighborhoodController = (): Controller => {
  const neighborhoodRepository = new NeighborhoodTypeOrmRepository()
  const dbAddNeighborhood = new DbAddNeighborhood(neighborhoodRepository)
  const validation = new ZodAddNeighborhoodValidator()
  return new AddNeighborhoodController(dbAddNeighborhood, validation)
}
