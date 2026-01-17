import { UserModel } from '@/modules/identity/domain/models/user'

export interface LoadUserByEmailRepository {
  loadByEmail: (email: string) => Promise<UserModel | undefined>
}
