import { Neighborhood } from '@/modules/geography/domain'

export interface AddNeighborhoodParams {
  name: string
  cityId: string
}

export interface AddNeighborhood {
  add(params: AddNeighborhoodParams): Promise<Neighborhood>
}
