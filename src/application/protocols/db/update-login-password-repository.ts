
import { Id } from '@/domain/value-objects/id'

export interface UpdateLoginPasswordRepository {
  updatePassword(id: Id, passwordHash: string): Promise<void>
}
