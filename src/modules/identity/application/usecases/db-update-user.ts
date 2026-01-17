import { UpdateUser, UpdateUserParams } from '@/modules/identity/domain/usecases/update-user'
import { UserModel } from '@/modules/identity/domain/models/user'
import { UpdateUserRepository } from '@/modules/identity/application/protocols/db/update-user-repository'

export class DbUpdateUser implements UpdateUser {
  constructor(private readonly updateUserRepository: UpdateUserRepository) { }

  async update(userData: UpdateUserParams): Promise<UserModel | null> {
    return await this.updateUserRepository.update(userData)
  }
}
