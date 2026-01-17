
import { BlockUser, BlockUserResult } from '@/modules/identity/application/usecases/block-user'
import { LoadLoginByUserIdRepository } from '@/modules/identity/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/modules/identity/application/protocols/db/load-role-by-id-repository'
import { UpdateUserStatusRepository } from '@/modules/identity/application/protocols/db/update-user-status-repository'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { left, right } from '@/shared/application/either'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

export class DbBlockUser implements BlockUser {
  constructor(
    private readonly loadLoginByUserId: LoadLoginByUserIdRepository,
    private readonly loadRoleById: LoadRoleByIdRepository,
    private readonly updateUserStatus: UpdateUserStatusRepository
  ) { }

  async block(actorId: string, targetId: string): Promise<BlockUserResult> {
    const actorLogin = await this.loadLoginByUserId.loadByUserId(actorId)
    if (!actorLogin) return left(new AccessDeniedError())

    const targetLogin = await this.loadLoginByUserId.loadByUserId(targetId)
    if (!targetLogin) return left(new NotFoundError('Login'))

    const actorRole = await this.loadRoleById.loadById(actorLogin.roleId)
    const targetRole = await this.loadRoleById.loadById(targetLogin.roleId)

    if (!actorRole || !targetRole) return left(new AccessDeniedError())

    if (actorRole.powerLevel <= targetRole.powerLevel) {
      return left(new AccessDeniedError())
    }

    const statusOrError = UserStatus.create('BLOCKED')
    if (statusOrError instanceof Error) {
      return left(statusOrError)
    }

    await this.updateUserStatus.updateStatus(targetId, statusOrError)
    return right(undefined)
  }
}
