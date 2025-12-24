import { UserModel } from '@/domain/models/user'

export interface LoadUsersRepository {
  loadAll: () => Promise<UserModel[]>
}
