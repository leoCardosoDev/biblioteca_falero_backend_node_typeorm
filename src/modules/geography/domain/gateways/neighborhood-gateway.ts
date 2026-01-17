import { Neighborhood } from '../entities/neighborhood'

export interface LoadNeighborhoodByNameAndCityRepository {
  loadByNameAndCity(name: string, cityId: string): Promise<Neighborhood | undefined>
}

export interface AddNeighborhoodRepository {
  findByNameAndCity(name: string, cityId: string): Promise<Neighborhood | undefined>
  add(name: string, cityId: string): Promise<Neighborhood>
}
