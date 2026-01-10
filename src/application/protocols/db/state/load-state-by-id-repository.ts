import { StateModel } from '@/domain/models/state'

export interface LoadStateByIdRepository {
  loadById: (id: string) => Promise<StateModel | undefined>
}
