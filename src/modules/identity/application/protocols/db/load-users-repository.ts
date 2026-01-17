import { UserWithLogin } from '@/modules/identity/domain/usecases/load-users'

export interface LoadUsersRepository {
  loadAll: () => Promise<UserWithLogin[]>
}
