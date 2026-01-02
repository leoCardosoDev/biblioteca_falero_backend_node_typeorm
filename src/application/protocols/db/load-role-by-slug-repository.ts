import { Role } from '@/domain/models/role'

export interface LoadRoleBySlugRepository {
  loadBySlug: (slug: string) => Promise<Role | null>
}
