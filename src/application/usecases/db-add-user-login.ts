import { AddUserLogin, AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { LoginModel } from '@/domain/models/login'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'

export class DbAddUserLogin implements AddUserLogin {
  constructor(
    private readonly hasher: Hasher,
    private readonly addLoginRepository: AddLoginRepository,
    private readonly loadRoleBySlugRepository: LoadRoleBySlugRepository
  ) { }

  async add(data: AddUserLoginParams): Promise<LoginModel> {
    const hashedPassword = await this.hasher.hash(data.password)
    const role = await this.loadRoleBySlugRepository.loadBySlug(data.role.value)
    if (!role) {
      throw new Error(`Role ${data.role.value} not found`)
    }

    const { role: _, ...loginData } = data

    const login = await this.addLoginRepository.add({
      ...loginData,
      passwordHash: hashedPassword,
      roleId: role.id
    })
    return login
  }
}
