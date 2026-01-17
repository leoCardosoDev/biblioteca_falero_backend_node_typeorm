import { Neighborhood } from '@/modules/geography/domain'
import { LoadNeighborhoodById } from '@/modules/geography/application/usecases/load-neighborhood-by-id'
import { LoadNeighborhoodByIdRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'

export class DbLoadNeighborhoodById implements LoadNeighborhoodById {
  constructor(private readonly loadNeighborhoodByIdRepository: LoadNeighborhoodByIdRepository) { }

  async load(id: string): Promise<Neighborhood | null> {
    const neighborhood = await this.loadNeighborhoodByIdRepository.loadById(id)
    return neighborhood || null
  }
}
