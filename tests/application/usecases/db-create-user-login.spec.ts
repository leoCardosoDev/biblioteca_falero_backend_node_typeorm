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
        slug: 'admin',
        description: 'Administrator'
      }))
    }
  }
  return new LoadRoleBySlugRepositoryStub()
}

interface SutTypes {
  sut: DbCreateUserLogin
  hasherStub: Hasher
  addLoginRepositoryStub: AddLoginRepository
  loadRoleBySlugRepositoryStub: LoadRoleBySlugRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addLoginRepositoryStub = makeAddLoginRepository()
  const loadRoleBySlugRepositoryStub = makeLoadRoleBySlugRepository()
  const sut = new DbCreateUserLogin(hasherStub, addLoginRepositoryStub, loadRoleBySlugRepositoryStub)
  return {
    sut,
    hasherStub,
    addLoginRepositoryStub,
    loadRoleBySlugRepositoryStub
  }
}

describe('DbCreateUserLogin UseCase', () => {
  const fakeLoginData: CreateUserLoginParams = {
    userId: Id.create(validUserId),
    email: Email.create('any_email@mail.com') as Email,
    password: 'any_password',
    role: UserRole.create('admin') as UserRole,
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
