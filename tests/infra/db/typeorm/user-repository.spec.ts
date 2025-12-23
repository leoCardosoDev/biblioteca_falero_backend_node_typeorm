import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

describe('UserTypeOrmRepository', () => {
  beforeAll(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-10T12:00:00Z'))

    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [UserTypeOrmEntity],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.clear()
  })

  const makeSut = (): UserTypeOrmRepository => {
    return new UserTypeOrmRepository()
  }

  test('Should return a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
    expect(user.name).toBe('any_name')
    expect(user.email).toBe('any_email@mail.com')
    expect(user.rg).toBe('any_rg')
    expect(user.cpf).toBe('any_cpf')
    expect(user.dataNascimento?.toISOString().split('T')[0]).toBe('1990-01-15')
  })

  test('Should throw when adding user with duplicate email', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: 'duplicate@mail.com',
      rg: 'any_rg',
      cpf: 'cpf_1',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    const promise = sut.add({
      name: 'other_name',
      email: 'duplicate@mail.com',
      rg: 'other_rg',
      cpf: 'cpf_2',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should throw when adding user with duplicate cpf', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: 'email_1@mail.com',
      rg: 'any_rg',
      cpf: 'duplicate_cpf',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    const promise = sut.add({
      name: 'other_name',
      email: 'email_2@mail.com',
      rg: 'other_rg',
      cpf: 'duplicate_cpf',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return a user on loadByEmail success', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name).toBe('any_name')
    expect(user?.email).toBe('any_email@mail.com')
    expect(user?.rg).toBe('any_rg')
    expect(user?.cpf).toBe('any_cpf')
    expect(user?.dataNascimento?.toISOString().split('T')[0]).toBe('1990-01-15')
  })

  test('Should return undefined if loadByEmail finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeUndefined()
  })

  test('Should return a user on loadByCpf success', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      dataNascimento: new Date('1990-01-15T12:00:00Z')
    })
    const user = await sut.loadByCpf('any_cpf')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name).toBe('any_name')
    expect(user?.email).toBe('any_email@mail.com')
    expect(user?.rg).toBe('any_rg')
    expect(user?.cpf).toBe('any_cpf')
    expect(user?.dataNascimento?.toISOString().split('T')[0]).toBe('1990-01-15')
  })

  test('Should return undefined if loadByCpf finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByCpf('any_cpf')
    expect(user).toBeUndefined()
  })
})
