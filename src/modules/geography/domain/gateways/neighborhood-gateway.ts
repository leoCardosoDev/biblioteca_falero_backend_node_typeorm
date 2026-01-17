import { NeighborhoodModel } from '../models/neighborhood'

export interface LoadNeighborhoodByNameAndCityRepository {
  loadByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined>
}

export interface AddNeighborhoodRepository {
  findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined>
  add(name: string, cityId: string): Promise<NeighborhoodModel>
}
