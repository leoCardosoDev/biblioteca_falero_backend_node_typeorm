import { Role } from '@/modules/identity/domain/models/role'
import { Id } from '@/shared/domain/value-objects/id'

export interface LoadRoleByIdRepository {
  loadById: (id: Id) => Promise<Role | null>
}
