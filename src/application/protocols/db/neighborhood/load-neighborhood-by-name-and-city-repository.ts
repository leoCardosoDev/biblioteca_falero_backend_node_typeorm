import { NeighborhoodModel } from '@/domain/models/neighborhood'

export interface LoadNeighborhoodByNameAndCityRepository {
  loadByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined>
}
