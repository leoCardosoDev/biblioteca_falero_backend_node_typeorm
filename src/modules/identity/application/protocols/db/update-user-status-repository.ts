
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

export interface UpdateUserStatusRepository {
  updateStatus: (userId: string, status: UserStatus) => Promise<void>
}
