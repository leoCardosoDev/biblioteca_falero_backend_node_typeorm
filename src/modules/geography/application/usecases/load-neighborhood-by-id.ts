import { Neighborhood } from '@/modules/geography/domain'

export interface LoadNeighborhoodById {
  load: (id: string) => Promise<Neighborhood | null>
}
