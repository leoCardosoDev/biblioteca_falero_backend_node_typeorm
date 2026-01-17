import { UserWithLogin } from '@/modules/identity/application/usecases/load-users'

export interface LoadUsersRepository {
  loadAll: () => Promise<UserWithLogin[]>
}
