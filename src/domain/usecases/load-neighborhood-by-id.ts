import { NeighborhoodModel } from '@/domain/models/neighborhood'

export interface LoadNeighborhoodById {
  load: (id: string) => Promise<NeighborhoodModel | null>
}
