import { UserModel } from '@/domain/models/user'

export interface LoadUsers {
  load: () => Promise<UserModel[]>
}
