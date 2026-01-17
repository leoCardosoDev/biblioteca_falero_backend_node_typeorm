import { Id } from '@/shared/domain/value-objects/id'

export interface StateModel {
  id: Id
  name: string
  uf: string
}
