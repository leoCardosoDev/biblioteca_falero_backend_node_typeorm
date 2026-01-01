import { UserWithLogin } from '@/domain/usecases/load-users'

export interface LoadUsersRepository {
  loadAll: () => Promise<UserWithLogin[]>
}
