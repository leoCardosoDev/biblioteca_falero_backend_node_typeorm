import { StateModel } from '@/domain/models/state'

export interface LoadStateByUfRepository {
  loadByUf(uf: string): Promise<StateModel>
}
