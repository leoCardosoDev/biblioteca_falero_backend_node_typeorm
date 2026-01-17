import { NeighborhoodModel } from '@/modules/geography/domain/models/neighborhood'

export interface LoadNeighborhoodByIdRepository {
  loadById: (id: string) => Promise<NeighborhoodModel | undefined>
}

export interface AddNeighborhoodRepository {
  findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined>
  add(name: string, cityId: string): Promise<NeighborhoodModel>
}
