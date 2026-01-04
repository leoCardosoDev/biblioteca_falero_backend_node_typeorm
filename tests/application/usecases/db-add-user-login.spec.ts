import { DbAddUserLogin } from '@/application/usecases/db-add-user-login'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { Login } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Email } from '@/domain/value-objects/email'
import { Role } from '@/domain/models/role'
import { AccessDeniedError } from '@/domain/errors'
import { UserWithLogin } from '@/domain/usecases/load-users'
import { UserModel } from '@/domain/models/user'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Cpf } from '@/domain/value-objects/cpf'

const validLoginId = '550e8400-e29b-41d4-a716-446655440000'
const validUserId = '550e8400-e29b-41d4-a716-446655440001'
const validRoleId = '550e8400-e29b-41d4-a716-446655440002'
const actorId = '550e8400-e29b-41d4-a716-446655440099'

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
    async add(_data: Omit<AddUserLoginParams, 'role' | 'actorId'> & { passwordHash: string, roleId: Id }): Promise<Login> {
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
        slug: 'admin',
        description: 'Administrator'
      }))
    }
  }
  return new LoadRoleBySlugRepositoryStub()
}

const makeLoadUserByIdRepository = (): LoadUserByIdRepository => {
  class LoadUserByIdRepositoryStub implements LoadUserByIdRepository {
    async loadById(id: string): Promise<UserWithLogin | null> {
      const adminRole = UserRole.create('ADMIN') as UserRole
      return Promise.resolve({
        id: Id.create(id),
        name: Name.create('Actor Name') as Name,
        email: Email.create('actor@mail.com'),
        rg: Rg.create('123456789') as Rg,
        cpf: Cpf.create('529.982.247-25'),
        gender: 'male',
        version: 1,
        status: UserStatus.create('ACTIVE') as UserStatus,
        login: {
          role: adminRole, // Default Actor is ADMIN (100)
          status: UserStatus.create('ACTIVE') as UserStatus
        }
      })
    }
  }
  return new LoadUserByIdRepositoryStub()
}

interface SutTypes {
  sut: DbAddUserLogin
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
  const sut = new DbAddUserLogin(hasherStub, addLoginRepositoryStub, loadRoleBySlugRepositoryStub, loadUserByIdRepositoryStub)
  return {
    sut,
    hasherStub,
    addLoginRepositoryStub,
    loadRoleBySlugRepositoryStub,
    loadUserByIdRepositoryStub
  }
}

describe('DbAddUserLogin UseCase', () => {
  const fakeLoginData: AddUserLoginParams = {
    actorId,
    userId: Id.create(validUserId),
    email: Email.create('any_email@mail.com') as Email,
    password: 'any_password',
    role: UserRole.create('STUDENT') as UserRole, // Target is STUDENT (0)
    status: UserStatus.create('active') as UserStatus
  }

  /* Access Control Tests */

  test('Should call LoadUserByIdRepository with correct actorId', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByIdRepositoryStub, 'loadById')
    await sut.add(fakeLoginData)
    expect(loadSpy).toHaveBeenCalledWith(actorId)
  })

  test('Should throw AccessDeniedError if actor is not found', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow(AccessDeniedError)
  })

  test('Should throw AccessDeniedError if actor has no login', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockResolvedValueOnce({
      id: Id.create(actorId),
      // ... minimal user mock without login
    } as UserModel)
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow(AccessDeniedError)
  })

  test('Should throw AccessDeniedError if Actor Power <= Target Power', async () => {
    const { sut, loadUserByIdRepositoryStub } = makeSut()
    // Mock Actor as STUDENT (0)
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockImplementationOnce(async () => {
      const studentRole = UserRole.create('STUDENT') as UserRole
      return {
        // ... user data
        login: {
          role: studentRole,
          status: UserStatus.create('ACTIVE') as UserStatus
        }
      } as UserModel
    })

    // Target is STUDENT (0) -> 0 <= 0 -> Fail
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow(AccessDeniedError)
  })

  test('Should succeed if Actor Power > Target Power', async () => {
    const { sut } = makeSut()
    // Actor is ADMIN (100) by default in mock
    // Target is STUDENT (0) -> 100 > 0 -> Success
    const login = await sut.add(fakeLoginData)
    expect(login).toBeTruthy()
  })

  /* Existing logic tests adapted */

  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    await sut.add(fakeLoginData)
    expect(hashSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockRejectedValueOnce(new Error())
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadRoleBySlugRepository with correct slug', async () => {
    const { sut, loadRoleBySlugRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug')
    await sut.add(fakeLoginData)
    expect(loadSpy).toHaveBeenCalledWith('STUDENT')
  })

  test('Should throw if LoadRoleBySlugRepository returns null (Role not found)', async () => {
    const { sut, loadRoleBySlugRepositoryStub } = makeSut()
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockResolvedValueOnce(null)
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddLoginRepository with correct values', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')
    await sut.add(fakeLoginData)
    // Destructure to remove actorId and role before checking equality with expected call
    const { role: _, actorId: __, ...expectedData } = fakeLoginData
    expect(addSpy).toHaveBeenCalledWith({
      ...expectedData,
      passwordHash: 'hashed_password',
      roleId: Id.create(validRoleId)
    })
  })

  test('Should throw if AddLoginRepository throws', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    jest.spyOn(addLoginRepositoryStub, 'add').mockRejectedValueOnce(new Error())
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return a login on success', async () => {
    const { sut } = makeSut()
    const login = await sut.add(fakeLoginData)
    expect(login).toBeTruthy()
    expect(login.roleId.value).toBe(validRoleId)
  })
})
