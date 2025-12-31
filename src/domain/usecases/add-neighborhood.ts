import { NeighborhoodModel } from '@/domain/models/neighborhood'

export interface AddNeighborhoodParams {
  name: string
  cityId: string
}

export interface AddNeighborhood {
  add(params: AddNeighborhoodParams): Promise<NeighborhoodModel>
}
