import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'

export class DbAddUser implements AddUser {
  constructor(private readonly addUserRepository: AddUserRepository) { }

  async add(userData: AddUserParams): Promise<UserModel> {
    const user = await this.addUserRepository.add(userData)
    return user
  }
}
