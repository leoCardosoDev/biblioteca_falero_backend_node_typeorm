import { Role } from '@/modules/identity/domain/models/role'

export interface LoadRoleBySlugRepository {
  loadBySlug: (slug: string) => Promise<Role | null>
}
