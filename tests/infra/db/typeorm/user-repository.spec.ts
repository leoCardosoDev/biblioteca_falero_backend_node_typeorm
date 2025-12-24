import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'

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

  const makeUserData = () => ({
    name: Name.create('any_name') as Name,
    email: Email.create('any_email@mail.com'),
    rg: Rg.create('123456789') as Rg,
    cpf: Cpf.create('529.982.247-25'),
    birthDate: BirthDate.create('1990-01-15') as BirthDate
  })

  test('Should return a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
    expect(user.name.value).toBe('any_name')
    expect(user.email.value).toBe('any_email@mail.com')
    expect(user.rg.value).toBe('123456789')
    expect(user.cpf.value).toBe('52998224725')
    expect(user.birthDate.value).toBe('1990-01-15')
  })

  test('Should throw when adding user with duplicate email', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const promise = sut.add({
      name: Name.create('other_name') as Name,
      email: Email.create('any_email@mail.com'),
      rg: Rg.create('987654321') as Rg,
      cpf: Cpf.create('71428793860'),
      birthDate: BirthDate.create('1990-01-15') as BirthDate
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should throw when adding user with duplicate cpf', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const promise = sut.add({
      name: Name.create('other_name') as Name,
      email: Email.create('other@mail.com'),
      rg: Rg.create('987654321') as Rg,
      cpf: Cpf.create('529.982.247-25'),
      birthDate: BirthDate.create('1990-01-15') as BirthDate
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return a user on loadByEmail success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name.value).toBe('any_name')
    expect(user?.email.value).toBe('any_email@mail.com')
    expect(user?.rg.value).toBe('123456789')
    expect(user?.cpf.value).toBe('52998224725')
    expect(user?.birthDate.value).toBe('1990-01-15')
  })

  test('Should return undefined if loadByEmail finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeUndefined()
  })

  test('Should return a user on loadByCpf success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const user = await sut.loadByCpf('52998224725')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name.value).toBe('any_name')
    expect(user?.email.value).toBe('any_email@mail.com')
    expect(user?.rg.value).toBe('123456789')
    expect(user?.cpf.value).toBe('52998224725')
    expect(user?.birthDate.value).toBe('1990-01-15')
  })

  test('Should return undefined if loadByCpf finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByCpf('52998224725')
    expect(user).toBeUndefined()
  })

  test('Should return all users on loadAll success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    await sut.add({
      name: Name.create('User 2') as Name,
      email: Email.create('user2@mail.com'),
      rg: Rg.create('987654321') as Rg,
      cpf: Cpf.create('71428793860'),
      birthDate: BirthDate.create('1985-05-20') as BirthDate
    })
    const users = await sut.loadAll()
    expect(users.length).toBe(2)
    expect(users[0].name.value).toBe('any_name')
    expect(users[1].name.value).toBe('User 2')
  })

  test('Should return empty list if no users found', async () => {
    const sut = makeSut()
    const users = await sut.loadAll()
    expect(users.length).toBe(0)
  })

  test('Should update a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      name: Name.create('updated_name') as Name,
      email: Email.create('updated_email@mail.com')
    })
    expect(updatedUser.name.value).toBe('updated_name')
    expect(updatedUser.email.value).toBe('updated_email@mail.com')
    expect(updatedUser.rg.value).toBe('123456789')
  })

  test('Should delete a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    await sut.delete(user.id.value)
    const deletedUser = await sut.loadByEmail('any_email@mail.com')
    expect(deletedUser).toBeUndefined()
  })
})
