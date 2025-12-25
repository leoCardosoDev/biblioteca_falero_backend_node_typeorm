import { SessionTypeOrmRepository } from './session-repository'
import { SessionTypeOrmEntity } from './entities/session-entity'
import { UserTypeOrmEntity } from './entities/user-entity'
import { LoginTypeOrmEntity } from './entities/login-entity'
import { TypeOrmHelper } from './typeorm-helper'
import { DataSource } from 'typeorm'

describe('SessionTypeOrmRepository', () => {
  let sut: SessionTypeOrmRepository

  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [SessionTypeOrmEntity, UserTypeOrmEntity, LoginTypeOrmEntity]
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
      birthDate: '2020-01-01',
      role: 'MEMBER'
    })
    return await repo.save(user)
  }

  const makeLogin = async (userId: string, role: string = 'ADMIN'): Promise<LoginTypeOrmEntity> => {
    const repo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const login = repo.create({
      userId,
      password: 'hashed_password',
      role
    })
    return await repo.save(login)
  }

  describe('save()', () => {
    test('Should save a session', async () => {
      const user = await makeUser()
      const session = await sut.save({
        userId: user.id,
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
        userId: user.id,
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
        userId: user.id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        ipAddress: 'any_ip',
        userAgent: 'any_agent',
        isValid: true
      })
      await sut.invalidate(session.id)
      const invalidSession = await sut.loadByToken('any_hash')
      expect(invalidSession).toBeNull() // because loadByToken filters by isValid: true
    })
  })

  describe('invalidateAllByUserId()', () => {
    test('Should invalidate all sessions by userId', async () => {
      const user = await makeUser()
      await sut.save({
        userId: user.id,
        refreshTokenHash: 'hash_1',
        expiresAt: new Date(),
        isValid: true
      })
      await sut.save({
        userId: user.id,
        refreshTokenHash: 'hash_2',
        expiresAt: new Date(),
        isValid: true
      })

      await sut.invalidateAllByUserId(user.id)

      const session1 = await sut.loadByToken('hash_1')
      const session2 = await sut.loadByToken('hash_2')

      expect(session1).toBeNull()
      expect(session2).toBeNull()
    })
  })

  describe('loadUserBySessionId()', () => {
    test('Should return user info with role from logins table', async () => {
      const user = await makeUser()
      await makeLogin(user.id, 'ADMIN')
      const session = await sut.save({
        userId: user.id,
        refreshTokenHash: 'any_hash',
        expiresAt: new Date(),
        isValid: true
      })

      const loadedUser = await sut.loadUserBySessionId(session.id)
      expect(loadedUser).toBeTruthy()
      expect(loadedUser?.id).toBe(user.id)
      expect(loadedUser?.name).toBe(user.name)
      expect(loadedUser?.role).toBe('ADMIN')
    })

    test('Should return null if session does not exist', async () => {
      const result = await sut.loadUserBySessionId('invalid_id')
      expect(result).toBeNull()
    })
  })

})
