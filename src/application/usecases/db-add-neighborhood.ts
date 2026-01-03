import { AddNeighborhood, AddNeighborhoodParams } from '@/domain/usecases/add-neighborhood'
import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Neighborhood } from '@/domain/value-objects/neighborhood'

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
