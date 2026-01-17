import { State } from '../entities/state'

export interface LoadStateByUfRepository {
  loadByUf(uf: string): Promise<State | null>
}
