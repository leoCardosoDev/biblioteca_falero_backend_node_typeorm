import { Id } from '@/shared/domain/value-objects/id'

export interface UpdateLoginStatusRepository {
  updateStatus: (id: Id, isActive: boolean) => Promise<void>
}
