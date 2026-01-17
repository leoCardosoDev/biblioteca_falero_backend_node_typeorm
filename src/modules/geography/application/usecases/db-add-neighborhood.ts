import { AddNeighborhood, AddNeighborhoodParams } from '@/modules/geography/application/usecases/add-neighborhood'
import { AddNeighborhoodRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'
import { NeighborhoodModel } from '@/modules/geography/domain/models/neighborhood'
import { Neighborhood } from '@/modules/geography/domain/entities/neighborhood'

export class DbAddNeighborhood implements AddNeighborhood {
  constructor(
    private readonly neighborhoodRepository: AddNeighborhoodRepository
  ) { }

  async add(params: AddNeighborhoodParams): Promise<NeighborhoodModel> {
    const neighborhoodOrError = Neighborhood.create(params.name)
    if (neighborhoodOrError instanceof Error) {
      throw neighborhoodOrError
    }
    const name = neighborhoodOrError.value

    const existing = await this.neighborhoodRepository.findByNameAndCity(name, params.cityId)
    if (existing) {
      return existing
    }
    return await this.neighborhoodRepository.add(name, params.cityId)
  }
}
