import { Role } from '@/modules/identity/domain/entities/role'

export interface LoadRoleBySlugRepository {
  loadBySlug: (slug: string) => Promise<Role | null>
}
