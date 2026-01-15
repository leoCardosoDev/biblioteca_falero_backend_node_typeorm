
import { Either } from '@/shared/either'
import { UserStatus } from '@/domain/value-objects/user-status'

export type ManageUserAccessParams = {
  actorId: string
  targetId: string
  roleSlug?: string
  status?: UserStatus
  password?: string
}

export type ManageUserAccessResult = Either<Error, void>

export interface ManageUserAccess {
  perform(params: ManageUserAccessParams): Promise<ManageUserAccessResult>
}
