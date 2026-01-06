import { UserModel } from '@/domain/models/user'
import { AddUserRepoParams } from '@/domain/usecases/add-user'

export interface AddUserRepository {
  add: (data: AddUserRepoParams) => Promise<UserModel>
}
