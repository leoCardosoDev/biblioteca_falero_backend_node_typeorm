import { Role } from '@/domain/models/role'
import { Id } from '@/domain/value-objects/id'

export interface LoadRoleByIdRepository {
  loadById: (id: Id) => Promise<Role | null>
}
