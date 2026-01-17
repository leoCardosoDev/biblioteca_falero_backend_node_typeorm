
import { ManageUserAccess, ManageUserAccessParams, ManageUserAccessResult } from '@/modules/identity/application/usecases/manage-user-access'
import { LoadLoginByUserIdRepository } from '@/modules/identity/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/modules/identity/application/protocols/db/load-role-by-id-repository'
import { LoadRoleBySlugRepository } from '@/modules/identity/application/protocols/db/load-role-by-slug-repository'
import { LoadUserByIdRepository } from '@/modules/identity/application/protocols/db/load-user-by-id-repository'
import { UpdateLoginPasswordRepository } from '@/modules/identity/application/protocols/db/update-login-password-repository'
import { UpdateLoginRoleRepository } from '@/modules/identity/application/protocols/db/update-login-role-repository'
import { UpdateUserStatusRepository } from '@/modules/identity/application/protocols/db/update-user-status-repository'
import { UpdateLoginStatusRepository } from '@/modules/identity/application/protocols/db/update-login-status-repository'
import { AddLoginRepository } from '@/modules/identity/application/protocols/db/add-login-repository'
import { Hasher } from '@/shared/application/protocols/cryptography/hasher'
import { HashComparer } from '@/shared/application/protocols/cryptography/hash-comparer'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { MissingParamError } from '@/shared/presentation/errors/missing-param-error'
import { left, right } from '@/shared/application/either'
import { Id } from '@/shared/domain/value-objects/id'

export class DbManageUserAccess implements ManageUserAccess {
  constructor(
    private readonly loadLoginByUserId: LoadLoginByUserIdRepository,
    private readonly loadRoleById: LoadRoleByIdRepository,
    private readonly loadRoleBySlug: LoadRoleBySlugRepository,
    private readonly loadUserById: LoadUserByIdRepository,
    private readonly updateLoginPassword: UpdateLoginPasswordRepository,
    private readonly updateLoginRole: UpdateLoginRoleRepository,
    private readonly updateUserStatus: UpdateUserStatusRepository,
    private readonly updateLoginStatus: UpdateLoginStatusRepository,
    private readonly addLoginRepository: AddLoginRepository,
    private readonly hasher: Hasher,
    private readonly hashComparer: HashComparer
  ) { }

  async perform(params: ManageUserAccessParams): Promise<ManageUserAccessResult> {
    const { actorId, targetId, roleSlug, status, password } = params

    const actorLogin = await this.loadLoginByUserId.loadByUserId(actorId)
    if (!actorLogin) return left(new AccessDeniedError())

    const actorRole = await this.loadRoleById.loadById(actorLogin.roleId)
    if (!actorRole) return left(new AccessDeniedError())

    const targetUser = await this.loadUserById.loadById(targetId)
    if (!targetUser) return left(new NotFoundError('User'))

    const targetLogin = await this.loadLoginByUserId.loadByUserId(targetId)

    // Determine the role to use
    let newRole = null
    if (roleSlug) {
      newRole = await this.loadRoleBySlug.loadBySlug(roleSlug)
      if (!newRole) return left(new NotFoundError('Role'))

      if (actorRole.powerLevel <= newRole.powerLevel) {
        return left(new AccessDeniedError())
      }
    }

    // UPSERT LOGIC: If no login exists, create one (requires password)
    if (!targetLogin) {
      if (!password) {
        return left(new MissingParamError('password'))
      }

      const passwordHash = await this.hasher.hash(password)
      const roleToAssign = newRole ?? await this.loadRoleBySlug.loadBySlug('READER')
      if (!roleToAssign) return left(new NotFoundError('Default Role'))

      await this.addLoginRepository.add({
        userId: Id.create(targetId),
        email: targetUser.email,
        passwordHash,
        roleId: roleToAssign.id,
        status: status
      })

      if (status && targetUser.status.value !== status.value) {
        await this.updateUserStatus.updateStatus(targetId, status)
      }

      return right(undefined)
    }

    // Existing login: permission check
    const targetRole = await this.loadRoleById.loadById(targetLogin.roleId)
    if (!targetRole) return left(new AccessDeniedError())

    if (actorRole.powerLevel <= targetRole.powerLevel) {
      return left(new AccessDeniedError())
    }

    // Update role only if different
    if (newRole && targetLogin.roleId.value !== newRole.id.value) {
      await this.updateLoginRole.updateRole(targetId, newRole.id.value)
    }

    // Update status only if different
    if (status && targetUser.status.value !== status.value) {
      await this.updateUserStatus.updateStatus(targetId, status)
      const isActive = status.value === 'ACTIVE'
      await this.updateLoginStatus.updateStatus(targetLogin.id, isActive)
    }

    // Update password only if provided and different
    if (password) {
      const isSamePassword = await this.hashComparer.compare(password, targetLogin.passwordHash)
      if (!isSamePassword) {
        const passwordHash = await this.hasher.hash(password)
        await this.updateLoginPassword.updatePassword(targetLogin.id, passwordHash)
      }
    }

    return right(undefined)
  }
}
