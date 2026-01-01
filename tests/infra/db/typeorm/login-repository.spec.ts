import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { DataSource } from 'typeorm'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'

describe('LoginTypeOrmRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity, UserTypeOrmEntity]
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
  })

  const makeSut = (): LoginTypeOrmRepository => {
    return new LoginTypeOrmRepository()
  }

  test('Should return an account on create success', async () => {
    const sut = makeSut()
    const userId = '550e8400-e29b-41d4-a716-446655440000'
    const createLoginParams: CreateUserLoginParams = {
      password: 'any_password',
      userId: Id.create(userId),
      role: UserRole.create('admin') as UserRole,
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.create(createLoginParams)
    expect(login).toBeTruthy()
    expect(login.id.value).toBeTruthy()
    expect(login.password).toBe('any_password')
    expect(login.userId.value).toBe(userId)
    expect(login.role.value).toBe('ADMIN')
  })

  test('Should return an account on loadByEmail success', async () => {
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

    const createLoginParams: CreateUserLoginParams = {
      password: 'hashed_password',
      userId: Id.create(user.id),
      role: UserRole.create('admin') as UserRole,
      status: UserStatus.create('active') as UserStatus
    }
    await sut.create(createLoginParams)
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeTruthy()
    expect(account?.id.value).toBeTruthy()
    expect(account?.password).toBe('hashed_password')
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
      gender: 'male'
    })
    await userRepo.save(user)

    const createLoginParams: CreateUserLoginParams = {
      password: 'any_password',
      userId: Id.create(user.id),
      role: UserRole.create('admin') as UserRole,
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.create(createLoginParams)
    expect(login.accessToken).toBeFalsy()
    await sut.updateAccessToken(login.id.value, 'any_token')
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account?.accessToken).toBe('any_token')
  })

  test('Should return an account on add success', async () => {
    const sut = makeSut()
    const userId = '550e8400-e29b-41d4-a716-446655440001'
    const addLoginParams = {
      userId: Id.create(userId),
      password: 'any_password',
      passwordHash: 'any_password_hash',
      role: UserRole.create('member') as UserRole,
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)
    expect(login).toBeTruthy()
    expect(login.id.value).toBeTruthy()
    expect(login.password).toBe('any_password_hash')
    expect(login.userId.value).toBe(userId)
    expect(login.role.value).toBe('MEMBER')
  })

  test('Should return login with default values if role and status are null in DB', async () => {
    const sut = makeSut()
    const userId = '550e8400-e29b-41d4-a716-446655440002'
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const loginEntity = loginRepo.create({
      userId,
      password: 'any_password',
      role: undefined,
      status: undefined
    })
    await loginRepo.save(loginEntity)

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.save(userRepo.create({
      id: userId,
      name: 'any_name',
      email: 'default_values@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male'
    }))

    const result = await sut.loadByEmail('default_values@mail.com')
    expect(result).toBeTruthy()
    expect(result?.role.value).toBe('MEMBER')
    expect(result?.status.value).toBe('active')
  })
})
