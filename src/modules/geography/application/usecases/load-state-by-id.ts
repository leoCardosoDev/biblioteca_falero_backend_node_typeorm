import { State } from '@/modules/geography/domain'

export interface LoadStateById {
  load: (id: string) => Promise<State | undefined>
}
