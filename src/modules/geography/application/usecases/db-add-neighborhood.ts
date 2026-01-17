import { Neighborhood } from '@/modules/geography/domain'
import { AddNeighborhood, AddNeighborhoodParams } from '@/modules/geography/application/usecases/add-neighborhood'
import { AddNeighborhoodRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'

export class DbAddNeighborhood implements AddNeighborhood {
  constructor(
    private readonly neighborhoodRepository: AddNeighborhoodRepository
  ) { }

  async add(params: AddNeighborhoodParams): Promise<Neighborhood> {
    const normalizedName = params.name.trim().toUpperCase()

    const existing = await this.neighborhoodRepository.findByNameAndCity(normalizedName, params.cityId)
    if (existing) {
      return existing
    }
    return await this.neighborhoodRepository.add(normalizedName, params.cityId)
  }
}
