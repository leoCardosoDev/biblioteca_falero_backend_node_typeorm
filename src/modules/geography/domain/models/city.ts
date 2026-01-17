import { Id } from '@/shared/domain/value-objects/id'

export interface CityModel {
  id: Id
  name: string
  stateId: Id
}
