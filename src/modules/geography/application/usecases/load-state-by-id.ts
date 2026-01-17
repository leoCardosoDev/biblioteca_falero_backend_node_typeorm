import { StateModel } from '@/modules/geography/domain'

export interface LoadStateById {
  load: (id: string) => Promise<StateModel | undefined>
}
