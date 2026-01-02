import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { Role } from '@/domain/models/role'
import { RoleTypeOrmEntity } from './entities/role-entity'
import { TypeOrmHelper } from './typeorm-helper'
import { Id } from '@/domain/value-objects/id'
import { Permission } from '@/domain/models/permission'

export class RoleTypeOrmRepository implements LoadRoleBySlugRepository, LoadRoleByIdRepository {
  async loadBySlug(slug: string): Promise<Role | null> {
    const repository = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    const roleEntity = await repository.findOne({
      where: { slug },
      relations: ['permissions']
    })

    if (!roleEntity) return null
    return this.toDomain(roleEntity)
  }

  async loadById(id: Id): Promise<Role | null> {
    const repository = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    const roleEntity = await repository.findOne({
      where: { id: id.value },
      relations: ['permissions']
    })

    if (!roleEntity) return null
    return this.toDomain(roleEntity)
  }

  private toDomain(entity: RoleTypeOrmEntity): Role {
    const permissions = entity.permissions.map(p => Permission.create({
      id: Id.create(p.id),
      slug: p.slug,
      description: p.description
    }))

    return Role.create({
      id: Id.create(entity.id), // Assuming Id.create parses UUID string
      slug: entity.slug,
      description: entity.description,
      permissions
    })
  }
}
