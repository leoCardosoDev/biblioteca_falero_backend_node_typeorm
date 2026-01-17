import { StateModel } from '../models/state'

export interface LoadStateByUfRepository {
  loadByUf(uf: string): Promise<StateModel | null>
}
