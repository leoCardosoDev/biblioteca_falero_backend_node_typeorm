import { AddNeighborhood, AddNeighborhoodParams } from '@/domain/usecases/add-neighborhood'
import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'

export class DbAddNeighborhood implements AddNeighborhood {
  constructor(
    private readonly neighborhoodRepository: AddNeighborhoodRepository
  ) { }

  async add(params: AddNeighborhoodParams): Promise<NeighborhoodModel> {
    const existing = await this.neighborhoodRepository.findByNameAndCity(params.name, params.cityId)
    if (existing) {
      return existing
    }
    return await this.neighborhoodRepository.add(params.name, params.cityId)
  }
}
