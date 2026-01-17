import { Id } from '@/shared/domain/value-objects/id'

export interface NeighborhoodModel {
  id: Id
  name: string
  cityId: Id
}
