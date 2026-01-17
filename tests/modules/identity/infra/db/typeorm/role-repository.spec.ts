
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { RoleRepository } from '@/modules/identity/infra/db/typeorm/repositories/role-repository'
import { RoleTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/permission-entity'
import { DataSource } from 'typeorm'
import { Id } from '@/shared/domain/value-objects/id'

describe('RoleRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [RoleTypeOrmEntity, PermissionTypeOrmEntity]
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
  })

  const makeSut = (): RoleRepository => {
    return new RoleRepository()
  }

  const makeFakeRole = async (): Promise<RoleTypeOrmEntity> => {
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    const permissionRepo = TypeOrmHelper.getRepository(PermissionTypeOrmEntity)
    const permission = await permissionRepo.save(permissionRepo.create({
      id: '550e8400-e29b-41d4-a716-446655440003',
      slug: 'any_permission',
      description: 'any_permission_description'
    }))

    const role = roleRepo.create({
      id: '550e8400-e29b-41d4-a716-446655440000',
      slug: 'any_slug',
      description: 'any_description',
      permissions: [permission]
    })
    return await roleRepo.save(role)
  }

  describe('loadBySlug()', () => {
    test('Should return a role on success', async () => {
      const sut = makeSut()
      await makeFakeRole()
      const role = await sut.loadBySlug('any_slug')
      expect(role).toBeTruthy()
      expect(role?.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(role?.slug).toBe('any_slug')
    })

    test('Should return null if loadBySlug fails', async () => {
      const sut = makeSut()
      const role = await sut.loadBySlug('any_slug')
      expect(role).toBeNull()
    })
  })

  describe('loadById()', () => {
    test('Should return a role on success', async () => {
      const sut = makeSut()
      await makeFakeRole()
      const role = await sut.loadById(Id.create('550e8400-e29b-41d4-a716-446655440000'))
      expect(role).toBeTruthy()
      expect(role?.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    test('Should return null if loadById fails', async () => {
      const sut = makeSut()
      const role = await sut.loadById(Id.create('550e8400-e29b-41d4-a716-446655440000'))
      expect(role).toBeNull()
    })
  })
})
