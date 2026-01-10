import { StateModel } from '@/domain/models/state'

export interface LoadStateById {
  load: (id: string) => Promise<StateModel | undefined>
}
