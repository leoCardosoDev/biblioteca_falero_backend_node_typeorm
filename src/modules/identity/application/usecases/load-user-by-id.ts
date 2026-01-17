import { UserWithLogin } from './load-users'

export interface LoadUserById {
  load: (id: string) => Promise<UserWithLogin | null>
}
