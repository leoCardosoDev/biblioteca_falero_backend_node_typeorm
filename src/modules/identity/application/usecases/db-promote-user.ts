
import { PromoteUser, PromoteUserResult } from '@/modules/identity/domain/usecases/promote-user'
import { LoadLoginByUserIdRepository } from '@/modules/identity/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/modules/identity/application/protocols/db/load-role-by-id-repository'
import { UpdateLoginRoleRepository } from '@/modules/identity/application/protocols/db/update-login-role-repository'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { left, right } from '@/shared/application/either'
import { Id } from '@/shared/domain/value-objects/id'

export class DbPromoteUser implements PromoteUser {
  constructor(
    private readonly loadLoginByUserId: LoadLoginByUserIdRepository,
    private readonly loadRoleById: LoadRoleByIdRepository,
    private readonly updateLoginRole: UpdateLoginRoleRepository
  ) { }

  async promote(actorId: string, targetId: string, newRoleId: string): Promise<PromoteUserResult> {
    const actorLogin = await this.loadLoginByUserId.loadByUserId(actorId)
    if (!actorLogin) return left(new AccessDeniedError())

    const targetLogin = await this.loadLoginByUserId.loadByUserId(targetId)
    if (!targetLogin) return left(new NotFoundError('Login'))

    const actorRole = await this.loadRoleById.loadById(actorLogin.roleId)
    const targetRole = await this.loadRoleById.loadById(targetLogin.roleId)
    const newRole = await this.loadRoleById.loadById(Id.create(newRoleId))

    if (!actorRole || !targetRole) return left(new AccessDeniedError())
    if (!newRole) return left(new NotFoundError('Role'))


    if (actorRole.powerLevel <= targetRole.powerLevel) {
      return left(new AccessDeniedError())
    }

    if (actorRole.powerLevel <= newRole.powerLevel) {
      return left(new AccessDeniedError())
    }

    await this.updateLoginRole.updateRole(targetId, newRoleId)
    return right(undefined)
  }
}
