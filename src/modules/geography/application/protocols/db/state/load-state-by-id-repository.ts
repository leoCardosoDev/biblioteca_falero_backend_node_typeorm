import { State } from '@/modules/geography/domain'

export interface LoadStateByIdRepository {
  loadById: (id: string) => Promise<State | undefined>
}
