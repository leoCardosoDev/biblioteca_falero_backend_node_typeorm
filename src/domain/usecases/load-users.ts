import { UserModel } from '@/domain/models/user'
import { LoginModel } from '@/domain/models/login'

export type UserWithLogin = UserModel & {
  login?: Omit<LoginModel, 'id' | 'userId' | 'password'>
}

export interface LoadUsers {
  load: () => Promise<UserWithLogin[]>
}
