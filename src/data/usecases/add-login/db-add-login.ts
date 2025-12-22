import { AddLogin, AddLoginParams } from '@/domain/usecases/add-login'
import { LoginModel } from '@/domain/models/login'
import { AddLoginRepository } from '@/data/protocols/db/add-login-repository'
import { Hasher } from '@/data/protocols/cryptography/hasher'

export class DbAddLogin implements AddLogin {
  constructor(
    private readonly hasher: Hasher,
    private readonly addLoginRepository: AddLoginRepository
  ) { }

  async add(loginData: AddLoginParams): Promise<LoginModel> {
    const hashedPassword = await this.hasher.hash(loginData.password)
    const login = await this.addLoginRepository.add(Object.assign({}, loginData, { password: hashedPassword }))
    return login
  }
}
