import { UserModel } from '@/modules/identity/domain/entities/user'
import { AddUserRepoParams } from '@/modules/identity/application/usecases/add-user'

export interface AddUserRepository {
  add: (data: AddUserRepoParams) => Promise<UserModel>
}
