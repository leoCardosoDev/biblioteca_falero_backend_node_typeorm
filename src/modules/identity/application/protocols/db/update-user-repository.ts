import { UpdateUserParams } from '@/modules/identity/application/usecases/update-user'
import { UserModel } from '@/modules/identity/domain/models/user'

export interface UpdateUserRepository {
  update: (userData: UpdateUserParams) => Promise<UserModel | null>
}
