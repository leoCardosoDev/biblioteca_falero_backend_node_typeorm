import { NeighborhoodModel } from '../models/neighborhood'

export interface LoadNeighborhoodById {
  load: (id: string) => Promise<NeighborhoodModel | null>
}
