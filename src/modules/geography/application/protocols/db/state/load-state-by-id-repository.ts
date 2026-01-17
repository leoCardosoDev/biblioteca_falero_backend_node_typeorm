import { StateModel } from '@/modules/geography/domain/models/state'

export interface LoadStateByIdRepository {
  loadById: (id: string) => Promise<StateModel | undefined>
}
