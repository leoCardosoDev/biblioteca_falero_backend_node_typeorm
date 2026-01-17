import { Neighborhood } from '@/modules/geography/domain'

export interface LoadNeighborhoodByIdRepository {
  loadById: (id: string) => Promise<Neighborhood | undefined>
}

export interface AddNeighborhoodRepository {
  findByNameAndCity(name: string, cityId: string): Promise<Neighborhood | undefined>
  add(name: string, cityId: string): Promise<Neighborhood>
}
