import { DbCreateUserLogin } from '@/application/usecases/db-create-user-login'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { Login } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Email } from '@/domain/value-objects/email'

import { Role } from '@/domain/models/role'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { UserWithLogin } from '@/domain/usecases/load-users'
import { Name } from '@/domain/value-objects/name'
import { Cpf } from '@/domain/value-objects/cpf'
import { Rg } from '@/domain/value-objects/rg'

const validLoginId = '550e8400-e29b-41d4-a716-446655440000'
const validUserId = '550e8400-e29b-41d4-a716-446655440001'
const validRoleId = '550e8400-e29b-41d4-a716-446655440002'

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(_value: string): Promise<string> {
      return Promise.resolve('hashed_password')
    }
  }
  return new HasherStub()
}

const makeAddLoginRepository = (): AddLoginRepository => {
  class AddLoginRepositoryStub implements AddLoginRepository {
    async add(_data: Omit<CreateUserLoginParams, 'role'> & { passwordHash: string, roleId: Id }): Promise<Login> {
      return Promise.resolve(Login.create({
        id: Id.create(validLoginId),
        userId: Id.create(validUserId),
        roleId: Id.create(validRoleId),
        email: Email.create('any_email@mail.com') as Email,
        passwordHash: 'hashed_password',
        isActive: true
      }))
    }
  }
  return new AddLoginRepositoryStub()
}

const makeLoadRoleBySlugRepository = (): LoadRoleBySlugRepository => {
  class LoadRoleBySlugRepositoryStub implements LoadRoleBySlugRepository {
    async loadBySlug(_slug: string): Promise<Role | null> {
      return Promise.resolve(Role.create({
        id: Id.create(validRoleId),
        slug: 'ADMIN',
        description: 'Administrator'
      }))
    }
  }
  return new LoadRoleBySlugRepositoryStub()
}

const makeLoadUserByIdRepository = (): LoadUserByIdRepository => {
  class LoadUserByIdRepositoryStub implements LoadUserByIdRepository {
    async loadById(_id: string): Promise<UserWithLogin | null> {
      return Promise.resolve({
        id: Id.create(validUserId),
        name: Name.create('Any Name') as Name,
        email: Email.create('any_email@mail.com') as Email,
        rg: Rg.create('123456789') as Rg,
        cpf: Cpf.create('12345678909') as Cpf,
        gender: 'male',
        status: UserStatus.create('ACTIVE') as UserStatus,
        version: 1
      })
    }
  }
  return new LoadUserByIdRepositoryStub()
}

interface SutTypes {
  sut: DbCreateUserLogin
  hasherStub: Hasher
  addLoginRepositoryStub: AddLoginRepository
  loadRoleBySlugRepositoryStub: LoadRoleBySlugRepository
  loadUserByIdRepositoryStub: LoadUserByIdRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addLoginRepositoryStub = makeAddLoginRepository()
  const loadRoleBySlugRepositoryStub = makeLoadRoleBySlugRepository()
  const loadUserByIdRepositoryStub = makeLoadUserByIdRepository()
  const sut = new DbCreateUserLogin(hasherStub, addLoginRepositoryStub, loadRoleBySlugRepositoryStub, loadUserByIdRepositoryStub)
  return {
    sut,
    hasherStub,
    addLoginRepositoryStub,
    loadRoleBySlugRepositoryStub,
    loadUserByIdRepositoryStub
  }
}

describe('DbCreateUserLogin UseCase', () => {
  const fakeLoginData: CreateUserLoginParams = {
    userId: Id.create(validUserId),
    password: 'any_password',
    role: UserRole.create('ADMIN') as UserRole,
    status: UserStatus.create('active') as UserStatus
  }

  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    await sut.create(fakeLoginData)
    expect(hashSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.create(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadUserByIdRepository with correct id', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByIdRepositoryStub, 'loadById')
    await sut.create(fakeLoginData)
    expect(loadSpy).toHaveBeenCalledWith(validUserId)
  })

  test('Should throw if LoadUserByIdRepository returns null', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)
    const promise = sut.create(fakeLoginData)
    await expect(promise).rejects.toThrow(`User ${validUserId} not found`)
  })

  test('Should call LoadRoleBySlugRepository with correct slug', async () => {
    const { sut, loadRoleBySlugRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug')
    await sut.create(fakeLoginData)
    expect(loadSpy).toHaveBeenCalledWith('ADMIN')
  })

  test('Should throw if LoadRoleBySlugRepository returns null (Role not found)', async () => {
    const { sut, loadRoleBySlugRepositoryStub } = makeSut()
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockResolvedValueOnce(null)
    const promise = sut.create(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddLoginRepository with correct values', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')
    await sut.create(fakeLoginData)
    const { role: _, ...expectedData } = fakeLoginData
    expect(addSpy).toHaveBeenCalledWith({
      ...expectedData,
      email: Email.create('any_email@mail.com'), // Email comes from user repository
      passwordHash: 'hashed_password',
      roleId: Id.create(validRoleId)
    })
  })

  test('Should throw if AddLoginRepository throws', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    jest.spyOn(addLoginRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.create(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return a Login on success', async () => {
    const { sut } = makeSut()
    const login = await sut.create(fakeLoginData)
    expect(login).toBeTruthy()
    expect(login.roleId.value).toBe(validRoleId)
  })
})
