import { Hasher, AddLoginRepository, LoadRoleBySlugRepository, LoadUserByIdRepository } from '@/application/protocols'
import { CreateUserLogin, CreateUserLoginParams, LoginModel, UserStatus } from '@/domain'

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
    const roleSlug = data.role?.value ?? 'STUDENT'
    const role = await this.loadRoleBySlugRepository.loadBySlug(roleSlug)
    if (!role) {
      throw new Error(`Role ${roleSlug} not found`)
    }

    const { role: _, ...loginData } = data
    // Default status to ACTIVE if not provided
    const status = loginData.status ?? (UserStatus.create('INACTIVE') as UserStatus)

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
