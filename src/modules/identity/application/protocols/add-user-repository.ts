import { UserModel } from '@/modules/identity/domain/models/user'
import { AddUserRepoParams } from '@/modules/identity/domain/usecases/add-user'

export interface AddUserRepository {
  add: (data: AddUserRepoParams) => Promise<UserModel>
}
