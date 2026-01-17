import { AddNeighborhoodController } from '@/modules/geography/presentation/controllers/add-neighborhood-controller'
import { DbAddNeighborhood } from '@/modules/geography/application/usecases/db-add-neighborhood'
import { NeighborhoodTypeOrmRepository } from '@/modules/geography/infra/db/typeorm/repositories/neighborhood-repository'
import { Controller } from '@/shared/presentation/protocols'
import { ZodAddNeighborhoodValidator } from '@/modules/geography/infra/validators/zod-add-neighborhood-validation'

export const makeAddNeighborhoodController = (): Controller => {
  const neighborhoodRepository = new NeighborhoodTypeOrmRepository()
  const dbAddNeighborhood = new DbAddNeighborhood(neighborhoodRepository)
  const validation = new ZodAddNeighborhoodValidator()
  return new AddNeighborhoodController(validation, dbAddNeighborhood)
}
