import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError, CpfInUseError } from '@/domain/errors'

export class DbAddUser implements AddUser {
  constructor(
    private readonly addUserRepository: AddUserRepository,
    private readonly loadUserByEmailRepository: LoadUserByEmailRepository,
    private readonly loadUserByCpfRepository: LoadUserByCpfRepository
  ) { }

  async add(userData: AddUserParams): Promise<UserModel | Error> {
    const userByEmail = await this.loadUserByEmailRepository.loadByEmail(userData.email.value)
    if (userByEmail) {
      return new EmailInUseError()
    }
    const userByCpf = await this.loadUserByCpfRepository.loadByCpf(userData.cpf.value)
    if (userByCpf) {
      return new CpfInUseError()
    }
    const user = await this.addUserRepository.add(userData)
    return user
  }
}
