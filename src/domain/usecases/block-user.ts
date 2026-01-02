
import { Either } from '@/shared/either'

export type BlockUserResult = Either<Error, void>

export interface BlockUser {
  block(actorId: string, targetId: string): Promise<BlockUserResult>
}
