
import { UserStatus } from '@/domain/value-objects/user-status'

export interface UpdateUserStatusRepository {
  updateStatus: (userId: string, status: UserStatus) => Promise<void>
}
