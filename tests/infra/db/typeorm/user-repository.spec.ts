import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

describe('UserTypeOrmRepository', () => {
  beforeAll(async () => {
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
      dataNascimento: new Date('1990-01-15')
    })
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
    expect(user.name).toBe('any_name')
    expect(user.email).toBe('any_email@mail.com')
    expect(user.rg).toBe('any_rg')
    expect(user.cpf).toBe('any_cpf')
    expect(user.dataNascimento).toEqual(new Date('1990-01-15'))
  })

  test('Should throw when adding user with duplicate email', async () => {
    const sut = makeSut()
    await sut.add({
      name: 'any_name',
      email: 'duplicate@mail.com',
      rg: 'any_rg',
      cpf: 'cpf_1',
      dataNascimento: new Date('1990-01-15')
    })
    const promise = sut.add({
      name: 'other_name',
      email: 'duplicate@mail.com',
      rg: 'other_rg',
      cpf: 'cpf_2',
      dataNascimento: new Date('1990-01-15')
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
      dataNascimento: new Date('1990-01-15')
    })
    const promise = sut.add({
      name: 'other_name',
      email: 'email_2@mail.com',
      rg: 'other_rg',
      cpf: 'duplicate_cpf',
      dataNascimento: new Date('1990-01-15')
    })
    await expect(promise).rejects.toThrow()
  })
})
