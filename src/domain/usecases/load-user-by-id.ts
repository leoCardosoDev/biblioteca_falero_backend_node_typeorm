import { UserWithLogin } from '@/domain/usecases/load-users'

export interface LoadUserById {
  load: (id: string) => Promise<UserWithLogin | null>
}
