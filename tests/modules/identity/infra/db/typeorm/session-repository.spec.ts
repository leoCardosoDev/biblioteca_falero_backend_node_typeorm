import { SessionTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/session-repository'
import { SessionTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/session-entity'
import { UserTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/login-entity'
import { RoleTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/permission-entity'
import { StateTypeOrmEntity as State } from '@/modules/geography/infra/db/typeorm/entities/state'
import { CityTypeOrmEntity as City } from '@/modules/geography/infra/db/typeorm/entities/city'
import { NeighborhoodTypeOrmEntity as Neighborhood } from '@/modules/geography/infra/db/typeorm/entities/neighborhood'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'
import { DataSource } from 'typeorm'

describe('SessionTypeOrmRepository', () => {
  let sut: SessionTypeOrmRepository

  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [SessionTypeOrmEntity, UserTypeOrmEntity, LoginTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, State, City, Neighborhood]
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const dataSource = (TypeOrmHelper as unknown as { client: DataSource }).client
    await dataSource.synchronize(true) // Clear DB
    sut = new SessionTypeOrmRepository()
  })

  const makeUser = async (): Promise<UserTypeOrmEntity> => {
    const repo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = repo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male'
    })
    return await repo.save(user)
  }

  const makeLogin = async (userId: string, roleSlug: string = 'ADMIN'): Promise<LoginTypeOrmEntity> => {
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    let role = await roleRepo.findOne({ where: { slug: roleSlug } })

    if (!role) {
      role = roleRepo.create({
        slug: roleSlug,
        description: `Description for ${roleSlug}`
      })
      role = await roleRepo.save(role)
    }

    const repo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = repo.create({
      userId,
      password: 'hashed_password',
      role: role
    })
    return await repo.save(login)
  }

  describe('save()', () => {
    test('Should save a session', async () => {
      const user = await makeUser()
      const session = await sut.save({
        userId: Id.create(user.id) as Id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        ipAddress: 'any_ip',
        userAgent: 'any_agent',
        isValid: true
      })
      expect(session).toBeTruthy()
      expect(session.id).toBeTruthy()
      expect(session.refreshTokenHash).toBe('any_hash')
    })
  })

  describe('loadByToken()', () => {
    test('Should load a session by token', async () => {
      const user = await makeUser()
      await sut.save({
        userId: Id.create(user.id) as Id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        ipAddress: 'any_ip',
        userAgent: 'any_agent',
        isValid: true
      })
      const session = await sut.loadByToken('any_hash')
      expect(session).toBeTruthy()
      expect(session?.id).toBeTruthy()
    })

    test('Should return null if token is not found', async () => {
      const session = await sut.loadByToken('invalid_hash')
      expect(session).toBeNull()
    })
  })

  describe('invalidate()', () => {
    test('Should invalidate a session', async () => {
      const user = await makeUser()
      const session = await sut.save({
        userId: Id.create(user.id) as Id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        ipAddress: 'any_ip',
        userAgent: 'any_agent',
        isValid: true
      })
      await sut.invalidate(session.id.value)
      const invalidSession = await sut.loadByToken('any_hash')
      expect(invalidSession).toBeNull() // because loadByToken filters by isValid: true
    })
  })



  describe('loadUserBySessionId()', () => {
    test('Should return user info with role from logins table', async () => {
      const user = await makeUser()
      await makeLogin(user.id, 'ADMIN')
      const session = await sut.save({
        userId: Id.create(user.id) as Id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        isValid: true
      })

      const loadedUser = await sut.loadUserBySessionId(session.id.value)
      expect(loadedUser).toBeTruthy()
      expect(loadedUser?.id.value).toBe(user.id)
      expect(loadedUser?.name).toBe(user.name)
      expect(loadedUser?.role).toBe('ADMIN')
    })

    test('Should return null if session does not exist', async () => {
      const result = await sut.loadUserBySessionId('invalid_id')
      expect(result).toBeNull()
    })

    test('Should return user info with default role STUDENT if no login found', async () => {
      const user = await makeUser()
      const session = await sut.save({
        userId: Id.create(user.id) as Id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        isValid: true
      })

      const loadedUser = await sut.loadUserBySessionId(session.id.value)
      expect(loadedUser).toBeTruthy()
      expect(loadedUser?.id.value).toBe(user.id)
      expect(loadedUser?.name).toBe(user.name)
      expect(loadedUser?.role).toBe('STUDENT')
    })
  })

})
