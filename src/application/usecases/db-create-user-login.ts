import { CreateUserLogin, CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { LoginModel } from '@/domain/models/login'

export class DbCreateUserLogin implements CreateUserLogin {
  constructor(
    private readonly hasher: Hasher,
    private readonly addLoginRepository: AddLoginRepository,
    private readonly loadRoleBySlugRepository: LoadRoleBySlugRepository,
    private readonly loadUserByIdRepository: LoadUserByIdRepository
  ) { }

  async create(data: CreateUserLoginParams): Promise<LoginModel> {
    const user = await this.loadUserByIdRepository.loadById(data.userId.value)
    if (!user) {
      throw new Error(`User ${data.userId.value} not found`)
    }

    const hashedPassword = await this.hasher.hash(data.password)
    const role = await this.loadRoleBySlugRepository.loadBySlug(data.role.value)
    if (!role) {
      throw new Error(`Role ${data.role.value} not found`)
    }

    const { role: _, ...loginData } = data

    const login = await this.addLoginRepository.add({
      ...loginData,
      email: user.email,
      passwordHash: hashedPassword,
      roleId: role.id
    })
    return login
  }
}
