import { UserModel } from '@/modules/identity/domain/entities/user'

export interface LoadUserByEmailRepository {
  loadByEmail: (email: string) => Promise<UserModel | undefined>
}
