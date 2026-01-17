import { StateModel } from '../models/state'

export interface LoadStateById {
  load: (id: string) => Promise<StateModel | undefined>
}
