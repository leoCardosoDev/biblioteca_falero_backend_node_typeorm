import { LoadNeighborhoodById } from '@/modules/geography/domain/usecases/load-neighborhood-by-id'
import { LoadNeighborhoodByIdRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'
import { NeighborhoodModel } from '@/modules/geography/domain/models/neighborhood'

export class DbLoadNeighborhoodById implements LoadNeighborhoodById {
  constructor(private readonly loadNeighborhoodByIdRepository: LoadNeighborhoodByIdRepository) { }

  async load(id: string): Promise<NeighborhoodModel | null> {
    const neighborhood = await this.loadNeighborhoodByIdRepository.loadById(id)
    return neighborhood || null
  }
}
