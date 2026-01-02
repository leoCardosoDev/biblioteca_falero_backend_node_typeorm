
import { Either } from '@/shared/either'

export type PromoteUserResult = Either<Error, void>

export interface PromoteUser {
  promote(actorId: string, targetId: string, newRoleId: string): Promise<PromoteUserResult>
}
