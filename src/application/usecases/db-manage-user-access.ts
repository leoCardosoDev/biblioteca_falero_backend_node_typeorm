
import { ManageUserAccess, ManageUserAccessParams, ManageUserAccessResult } from '@/domain/usecases'
import { UserStatus } from '@/domain/value-objects'
import {
  LoadLoginByUserIdRepository,
  LoadRoleByIdRepository,
  LoadRoleBySlugRepository,
  UpdateLoginRoleRepository,
  UpdateUserStatusRepository,
  UpdateLoginPasswordRepository,
  UpdateLoginStatusRepository,
  AddLoginRepository,
  LoadUserByIdRepository
} from '@/application/protocols/db'
import { Hasher } from '@/application/protocols/cryptography'
import { AccessDeniedError, NotFoundError } from '@/domain/errors'
import { left, right } from '@/shared/either'
import { getPowerLevel } from '@/domain/models'

export class DbManageUserAccess implements ManageUserAccess {
  constructor(
    private readonly loadLoginByUserId: LoadLoginByUserIdRepository,
    private readonly loadRoleById: LoadRoleByIdRepository,
    private readonly loadRoleBySlug: LoadRoleBySlugRepository,
    private readonly updateLoginRole: UpdateLoginRoleRepository,
    private readonly updateUserStatus: UpdateUserStatusRepository,
    private readonly updateLoginPassword: UpdateLoginPasswordRepository,
    private readonly updateLoginStatus: UpdateLoginStatusRepository,
    private readonly addLoginRepository: AddLoginRepository,
    private readonly loadUserByIdRepository: LoadUserByIdRepository,
    private readonly hasher: Hasher
  ) { }

  async perform(params: ManageUserAccessParams): Promise<ManageUserAccessResult> {
    const actorLogin = await this.loadLoginByUserId.loadByUserId(params.actorId)
    if (!actorLogin) return left(new AccessDeniedError())

    const targetLogin = await this.loadLoginByUserId.loadByUserId(params.targetId)
    const actorRole = await this.loadRoleById.loadById(actorLogin.roleId)
    if (!actorRole) return left(new AccessDeniedError())

    if (!targetLogin) {
      if (!params.password) return left(new NotFoundError('Login'))

      const targetUser = await this.loadUserByIdRepository.loadById(params.targetId)
      if (!targetUser) return left(new NotFoundError('User'))

      const roleSlug = params.roleSlug ?? 'STUDENT'
      const newRole = await this.loadRoleBySlug.loadBySlug(roleSlug)
      if (!newRole) return left(new NotFoundError('Role'))

      if (getPowerLevel(actorRole) < getPowerLevel(newRole)) {
        return left(new AccessDeniedError())
      }

      const hashedPassword = await this.hasher.hash(params.password)
      const statusParam = params.status ? params.status : UserStatus.create('ACTIVE')
      const status = statusParam instanceof Error ? UserStatus.create('ACTIVE') as UserStatus : statusParam

      await this.addLoginRepository.add({
        userId: targetUser.id,
        email: targetUser.email,
        password: params.password,
        passwordHash: hashedPassword,
        roleId: newRole.id,
        status
      })

      return right(undefined)
    }

    const targetRole = await this.loadRoleById.loadById(targetLogin.roleId)
    if (!targetRole) return left(new AccessDeniedError())



    if (getPowerLevel(actorRole) <= getPowerLevel(targetRole)) {
      return left(new AccessDeniedError())
    }

    if (params.roleSlug) {
      const newRole = await this.loadRoleBySlug.loadBySlug(params.roleSlug)
      if (!newRole) return left(new NotFoundError('Role'))

      if (getPowerLevel(actorRole) < getPowerLevel(newRole)) {
        return left(new AccessDeniedError())
      }

      await this.updateLoginRole.updateRole(params.targetId, newRole.id.value)
    }

    if (params.status) {
      await this.updateUserStatus.updateStatus(params.targetId, params.status)
    }

    if (params.password) {
      const hashedPassword = await this.hasher.hash(params.password)
      await this.updateLoginPassword.updatePassword(targetLogin.id, hashedPassword)
      await this.updateLoginStatus.updateStatus(targetLogin.id, true)
    }

    return right(undefined)
  }
}
