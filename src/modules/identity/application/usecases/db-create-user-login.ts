import { Hasher } from '@/shared/application/protocols/cryptography/hasher'
import { AddLoginRepository, LoadRoleByIdRepository, LoadUserByIdRepository } from '@/modules/identity/application/protocols/db'
import { AddUserLogin, AddUserLoginParams } from '@/modules/identity/application/usecases/add-user-login'
import { LoginModel } from '@/modules/identity/domain/models/login'

import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { LoadRoleBySlugRepository } from '@/modules/identity/application/protocols/db/load-role-by-slug-repository'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { Role } from '@/modules/identity/domain/models/role'

export class DbCreateUserLogin implements AddUserLogin {
  constructor(
    private readonly hasher: Hasher,
    private readonly addLoginRepository: AddLoginRepository,
    private readonly loadRoleByIdRepository: LoadRoleByIdRepository,
    private readonly loadUserByIdRepository: LoadUserByIdRepository,
    private readonly loadRoleBySlugRepository: LoadRoleBySlugRepository
  ) { }

  async add(data: AddUserLoginParams): Promise<LoginModel> {
    const actor = await this.loadUserByIdRepository.loadById(data.actorId.value)
    if (!actor) {
      throw new AccessDeniedError()
    }
    if (!actor.login) {
      throw new AccessDeniedError()
    }

    const user = await this.loadUserByIdRepository.loadById(data.userId.value)
    if (!user) {
      throw new Error(`User ${data.userId.value} not found`)
    }

    const hashedPassword = await this.hasher.hash(data.password.value)

    let targetRole: Role | null = null

    if (data.role) {
      const roleSlug = data.role.value
      targetRole = await this.loadRoleBySlugRepository.loadBySlug(roleSlug)
      if (!targetRole) {
        throw new Error(`Role ${roleSlug} not found`) // Or specific domain error
      }
    } else {
      targetRole = await this.loadRoleBySlugRepository.loadBySlug('STUDENT')
    }

    if (!targetRole) {
      throw new Error('Default role not found')
    }

    if (actor.login.role.powerLevel <= targetRole.powerLevel) {
      throw new AccessDeniedError()
    }

    const { role: _, actorId: __, ...loginData } = data
    const status = loginData.status ?? (UserStatus.create('INACTIVE') as UserStatus)

    const login = await this.addLoginRepository.add({
      ...loginData,
      status: status,
      email: user.email,
      passwordHash: hashedPassword,
      userId: data.userId,
      roleId: targetRole.id,
    })
    return login
  }
}
