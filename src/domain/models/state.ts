import { Id } from '@/domain/value-objects/id'

export interface StateModel {
  id: Id
  name: string
  uf: string
}
