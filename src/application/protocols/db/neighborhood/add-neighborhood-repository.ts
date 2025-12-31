import { NeighborhoodModel } from '@/domain/models/neighborhood'

export interface AddNeighborhoodRepository {
  findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined>
  add(name: string, cityId: string): Promise<NeighborhoodModel>
}
