import { CreateUserLogin, CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { CreateUserLoginRepository } from '@/application/protocols/db/create-user-login-repository'
import { LoginModel } from '@/domain/models/login'

export class DbCreateUserLogin implements CreateUserLogin {
  constructor(
    private readonly hasher: Hasher,
    private readonly createUserLoginRepository: CreateUserLoginRepository
  ) { }

  async create(data: CreateUserLoginParams): Promise<LoginModel> {
    const hashedPassword = await this.hasher.hash(data.password)
    const login = await this.createUserLoginRepository.create({ ...data, password: hashedPassword })
    return login
  }
}
