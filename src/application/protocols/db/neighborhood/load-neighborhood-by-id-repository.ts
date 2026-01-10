import { NeighborhoodModel } from '@/domain/models/neighborhood'

export interface LoadNeighborhoodByIdRepository {
  loadById: (id: string) => Promise<NeighborhoodModel | undefined>
}
