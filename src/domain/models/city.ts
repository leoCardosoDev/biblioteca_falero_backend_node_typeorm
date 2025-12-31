import { Id } from '@/domain/value-objects/id'

export interface CityModel {
  id: Id
  name: string
  stateId: Id
}
