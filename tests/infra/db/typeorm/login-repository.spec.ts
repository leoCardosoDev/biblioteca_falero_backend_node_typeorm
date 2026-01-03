import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
import { DataSource } from 'typeorm'
import { Id } from '@/domain/value-objects/id'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Email } from '@/domain/value-objects/email'

describe('LoginTypeOrmRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity, UserTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity]
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save(roleRepo.create({
      id: '550e8400-e29b-41d4-a716-446655440002',
      slug: 'member',
      description: 'Member'
    }))
  })

  const makeSut = (): LoginTypeOrmRepository => {
    return new LoginTypeOrmRepository()
  }

  test('Should return an account on loadByEmail success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('any_email@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    await sut.add(addLoginParams)
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeTruthy()
    expect(account?.id.value).toBeTruthy()
    expect(account?.passwordHash).toBe('hashed_password')
    expect(account?.userId.value).toBe(user.id)
  })

  test('Should return undefined if loadByEmail fails', async () => {
    const sut = makeSut()
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should return undefined if loadByEmail finds user but not login', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male'
    })
    await userRepo.save(user)
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should update the account accessToken on updateAccessToken success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('any_email@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)

    // Verify DB directly for accessToken, as Login model might not expose it
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    let dbLogin = await loginRepo.findOneBy({ id: login.id.value })
    expect(dbLogin?.accessToken).toBeFalsy()

    await sut.updateAccessToken(login.id.value, 'any_token')

    dbLogin = await loginRepo.findOneBy({ id: login.id.value })
    expect(dbLogin?.accessToken).toBe('any_token')
  })

  test('Should return an account on add success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create(user.email) as Email,
      password: 'any_password',
      passwordHash: 'any_password_hash',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)
    expect(login).toBeTruthy()
    expect(login.id.value).toBeTruthy()
    expect(login.passwordHash).toBe('any_password_hash')
    expect(login.userId.value).toBe(user.id)
    expect(login.roleId.value).toBe('550e8400-e29b-41d4-a716-446655440002')
  })

  test('Should return undefined if roleId is missing in DB', async () => {
    const sut = makeSut()
    const userId = '550e8400-e29b-41d4-a716-446655440002'
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    // create FK user first
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.save(userRepo.create({
      id: userId,
      name: 'any_name',
      email: 'default_values@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male'
    }))

    const loginEntity = loginRepo.create({
      userId,
      password: 'any_password',
      roleId: undefined, // Role is missing
      status: 'active'
    } as unknown as LoginTypeOrmEntity)
    await loginRepo.save(loginEntity)

    const result = await sut.loadByEmail('default_values@mail.com')
    expect(result).toBeUndefined()
  })

  test('Should return undefined if loadByEmail finds user but is soft deleted', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'deleted_user',
      email: 'deleted@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      deletedAt: new Date(),
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save({
      userId: user.id,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440002', // use roleId instead of role
      status: 'active'
    })

    const account = await sut.loadByEmail('deleted@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should return undefined if loadByEmail finds user but status is INACTIVE', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'inactive_user',
      email: 'inactive@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save({
      userId: user.id,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440002', // roleId
      status: 'active'
    })

    const account = await sut.loadByEmail('inactive@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should update the login role on updateRole success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'role_update@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    // Seed target role
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save(roleRepo.create({
      id: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'admin',
      description: 'Admin'
    }))

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('role_update@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)

    await sut.updateRole(user.id, '550e8400-e29b-41d4-a716-446655440001')

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const dbLogin = await loginRepo.findOneBy({ id: login.id.value })
    expect(dbLogin?.roleId).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('Should return a login on loadByUserId success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'load_by_id@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('load_by_id@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    await sut.add(addLoginParams)

    const login = await sut.loadByUserId(user.id)
    expect(login).toBeTruthy()
    expect(login?.userId.value).toBe(user.id)
  })

  test('Should return undefined if loadByUserId fails', async () => {
    const sut = makeSut()
    const login = await sut.loadByUserId('invalid_id')
    expect(login).toBeUndefined()
  })
})
