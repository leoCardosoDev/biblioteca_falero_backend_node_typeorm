import { UserModel } from '@/modules/identity/domain/models/user'


export type UserWithLogin = UserModel

export interface LoadUsers {
  load: () => Promise<UserWithLogin[]>
}
