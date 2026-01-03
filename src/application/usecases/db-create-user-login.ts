import { CreateUserLogin, CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { LoginModel } from '@/domain/models/login'
import { UserStatus } from '@/domain/value-objects/user-status'

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
    const roleSlug = data.role?.value ?? 'MEMBER'
    const role = await this.loadRoleBySlugRepository.loadBySlug(roleSlug)
    if (!role) {
      throw new Error(`Role ${roleSlug} not found`)
    }

    const { role: _, ...loginData } = data
    // Default status to ACTIVE if not provided
    const status = loginData.status ?? (UserStatus.create('ACTIVE') as UserStatus)

    const login = await this.addLoginRepository.add({
      ...loginData,
      status,
      email: user.email,
      passwordHash: hashedPassword,
      roleId: role.id
    })
    return login
  }
}
