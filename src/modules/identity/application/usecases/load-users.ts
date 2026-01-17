import { UserModel } from '@/modules/identity/domain/entities/user'


export type UserWithLogin = UserModel

export interface LoadUsers {
  load: () => Promise<UserWithLogin[]>
}
