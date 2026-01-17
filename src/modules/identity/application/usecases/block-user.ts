
import { Either } from '@/shared/application/either'

export type BlockUserResult = Either<Error, void>

export interface BlockUser {
  block(actorId: string, targetId: string): Promise<BlockUserResult>
}
