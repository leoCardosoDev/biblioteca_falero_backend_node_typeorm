import { UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'

export interface UpdateUserRepository {
  update: (userData: UpdateUserParams) => Promise<UserModel>
}
