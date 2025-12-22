import { UserModel } from '@/domain/models/user'
import { AddUserParams } from '@/domain/usecases/add-user'

export interface AddUserRepository {
  add: (data: AddUserParams) => Promise<UserModel>
}
