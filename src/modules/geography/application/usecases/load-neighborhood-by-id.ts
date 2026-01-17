import { NeighborhoodModel } from '@/modules/geography/domain'

export interface LoadNeighborhoodById {
  load: (id: string) => Promise<NeighborhoodModel | null>
}
