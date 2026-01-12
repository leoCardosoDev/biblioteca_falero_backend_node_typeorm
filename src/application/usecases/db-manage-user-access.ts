
import { ManageUserAccess, ManageUserAccessParams, ManageUserAccessResult } from '@/domain/usecases/manage-user-access'
import { LoadLoginByUserIdRepository } from '@/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { UpdateLoginRoleRepository } from '@/application/protocols/db/update-login-role-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { UpdateLoginPasswordRepository } from '@/application/protocols/db/update-login-password-repository'
import { UpdateLoginStatusRepository } from '@/application/protocols/db/update-login-status-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'
import { left, right } from '@/shared/either'
import { getPowerLevel } from '@/domain/models/role'

export class DbManageUserAccess implements ManageUserAccess {
  constructor(
    private readonly loadLoginByUserId: LoadLoginByUserIdRepository,
    private readonly loadRoleById: LoadRoleByIdRepository,
    private readonly loadRoleBySlug: LoadRoleBySlugRepository,
    private readonly updateLoginRole: UpdateLoginRoleRepository,
    private readonly updateUserStatus: UpdateUserStatusRepository,
    private readonly updateLoginPassword: UpdateLoginPasswordRepository,
    private readonly updateLoginStatus: UpdateLoginStatusRepository,
    private readonly hasher: Hasher
  ) { }

  async perform(params: ManageUserAccessParams): Promise<ManageUserAccessResult> {
    // 1. Load Actor
    const actorLogin = await this.loadLoginByUserId.loadByUserId(params.actorId)
    if (!actorLogin) return left(new AccessDeniedError())

    // 2. Load Target
    const targetLogin = await this.loadLoginByUserId.loadByUserId(params.targetId)
    if (!targetLogin) {
      // If updating status only, maybe target has no login yet? 
      // Requirement says "Access Credentials", so we assume login exists.
      // If user exists but no login, we can't manage access via this UseCase.
      return left(new NotFoundError('Login'))
    }

    // 3. Verify Hierarchy (Actor vs Target)
    const actorRole = await this.loadRoleById.loadById(actorLogin.roleId)
    const targetRole = await this.loadRoleById.loadById(targetLogin.roleId)

    if (!actorRole || !targetRole) return left(new AccessDeniedError())

    // Actor must be strictly higher than Target to modify them
    if (getPowerLevel(actorRole) <= getPowerLevel(targetRole)) {
      return left(new AccessDeniedError())
    }

    // 4. Update Role
    if (params.roleSlug) {
      const newRole = await this.loadRoleBySlug.loadBySlug(params.roleSlug)
      if (!newRole) return left(new NotFoundError('Role'))

      // Actor must be higher or equal to the New Role they are granting?
      // Usually you cannot grant a role higher than yourself.
      // Or you cannot grant a role equal to yourself (to avoid creating competitors).
      // Let's stick to: Actor >= NewRole.
      if (getPowerLevel(actorRole) < getPowerLevel(newRole)) {
        return left(new AccessDeniedError())
      }

      await this.updateLoginRole.updateRole(params.targetId, newRole.id.value)
    }

    // 5. Update Status
    if (params.status) {
      // UserStatusRepository uses UserId, not LoginId/TargetId.
      // But commonly targetId == userId in this context if coming from /users/:id/access
      // Let's verify if params.targetId is UserId.
      // The Spec says targetId. In `DbBlockUser` actorId and targetId are UserIds.
      // So we are good.
      await this.updateUserStatus.updateStatus(params.targetId, params.status)
    }

    // 6. Update Password
    if (params.password) {
      const hashedPassword = await this.hasher.hash(params.password)
      await this.updateLoginPassword.updatePassword(targetLogin.id, hashedPassword)
      // Login status changes automatically to ACTIVE when password is set
      await this.updateLoginStatus.updateStatus(targetLogin.id, true)
    }

    return right(undefined)
  }
}
