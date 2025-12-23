import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { DataSource } from 'typeorm'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'

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
    const createLoginParams: CreateUserLoginParams = {
      password: 'any_password',
      userId: 'any_user_id',
      role: 'any_role'
    }
    const login = await sut.create(createLoginParams)
    expect(login).toBeTruthy()
    expect(login.id).toBeTruthy()
    expect(login.password).toBe('any_password')
    expect(login.userId).toBe('any_user_id')
    expect(login.role).toBe('any_role')
  })

  test('Should return an account on loadByEmail success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf'
    })
    await userRepo.save(user)

    const createLoginParams: CreateUserLoginParams = {
      password: 'hashed_password',
      userId: user.id,
      role: 'admin'
    }
    await sut.create(createLoginParams)
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeTruthy()
    expect(account?.id).toBeTruthy()
    expect(account?.password).toBe('hashed_password')
    expect(account?.userId).toBe(user.id)
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
      cpf: 'any_cpf'
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
      cpf: 'any_cpf'
    })
    await userRepo.save(user)

    const createLoginParams: CreateUserLoginParams = {
      password: 'any_password',
      userId: user.id,
      role: 'any_role'
    }
    const login = await sut.create(createLoginParams)
    expect(login.accessToken).toBeFalsy()
    await sut.updateAccessToken(login.id, 'any_token')
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account?.accessToken).toBe('any_token')
  })
})
