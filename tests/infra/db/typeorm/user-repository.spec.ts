import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Id } from '@/domain/value-objects/id'

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
      email: Email.create('any_email@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
    expect(user.name).toBe('any_name')
    expect(user.email.value).toBe('any_email@mail.com')
    expect(user.rg).toBe('any_rg')
    expect(user.cpf.value).toBe('52998224725')
    expect(user.dataNascimento).toBe('1990-01-15')
  })

  test('Should throw when adding user with duplicate email', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: Email.create('duplicate@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    const promise = sut.add({
      name: 'other_name',
      email: Email.create('duplicate@mail.com'),
      rg: 'other_rg',
      cpf: Cpf.create('71428793860'),
      dataNascimento: '1990-01-15'
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should throw when adding user with duplicate cpf', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: Email.create('email_1@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    const promise = sut.add({
      name: 'other_name',
      email: Email.create('email_2@mail.com'),
      rg: 'other_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return a user on loadByEmail success', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: Email.create('any_email@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name).toBe('any_name')
    expect(user?.email.value).toBe('any_email@mail.com')
    expect(user?.rg).toBe('any_rg')
    expect(user?.cpf.value).toBe('52998224725')
    expect(user?.dataNascimento).toBe('1990-01-15')
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
      email: Email.create('any_email@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    const user = await sut.loadByCpf('52998224725')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name).toBe('any_name')
    expect(user?.email.value).toBe('any_email@mail.com')
    expect(user?.rg).toBe('any_rg')
    expect(user?.cpf.value).toBe('52998224725')
    expect(user?.dataNascimento).toBe('1990-01-15')
  })

  test('Should return undefined if loadByCpf finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByCpf('52998224725')
    expect(user).toBeUndefined()
  })

  test('Should return all users on loadAll success', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'User 1',
      email: Email.create('user1@mail.com'),
      rg: 'rg1',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    await sut.add({
      name: 'User 2',
      email: Email.create('user2@mail.com'),
      rg: 'rg2',
      cpf: Cpf.create('71428793860'),
      dataNascimento: '1990-01-15'
    })
    const users = await sut.loadAll()
    expect(users.length).toBe(2)
    expect(users[0].name).toBe('User 1')
    expect(users[1].name).toBe('User 2')
  })

  test('Should return empty list if no users found', async () => {
    const sut = makeSut()
    const users = await sut.loadAll()
    expect(users.length).toBe(0)
  })

  test('Should update a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add({
      name: 'any_name',
      email: Email.create('any_email@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    const updatedUser = await sut.update({
      id: user.id,
      name: 'updated_name',
      email: Email.create('updated_email@mail.com')
    })
    expect(updatedUser.name).toBe('updated_name')
    expect(updatedUser.email.value).toBe('updated_email@mail.com')
    expect(updatedUser.rg).toBe('any_rg')
  })

  test('Should delete a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add({
      name: 'any_name',
      email: Email.create('any_email@mail.com'),
      rg: 'any_rg',
      cpf: Cpf.create('529.982.247-25'),
      dataNascimento: '1990-01-15'
    })
    await sut.delete(user.id.value)
    const deletedUser = await sut.loadByEmail('any_email@mail.com')
    expect(deletedUser).toBeUndefined()
  })
})
