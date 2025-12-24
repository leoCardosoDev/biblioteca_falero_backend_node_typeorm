import { UpdateUser, UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { UpdateUserRepository } from '@/application/protocols/db/update-user-repository'

export class DbUpdateUser implements UpdateUser {
  constructor(private readonly updateUserRepository: UpdateUserRepository) { }

  async update(userData: UpdateUserParams): Promise<UserModel> {
    return await this.updateUserRepository.update(userData)
  }
}
