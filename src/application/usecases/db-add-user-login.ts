import { AddUserLogin, AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { LoginModel } from '@/domain/models/login'

export class DbAddUserLogin implements AddUserLogin {
  constructor(
    private readonly hasher: Hasher,
    private readonly addLoginRepository: AddLoginRepository
  ) { }

  async add(data: AddUserLoginParams): Promise<LoginModel> {
    const hashedPassword = await this.hasher.hash(data.password)
    const login = await this.addLoginRepository.add({
      ...data,
      passwordHash: hashedPassword
    })
    return login
  }
}
