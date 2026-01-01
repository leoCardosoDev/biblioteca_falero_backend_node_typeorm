import { DbAddUserLogin } from '@/application/usecases/db-add-user-login'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { LoginModel } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'

const validLoginId = '550e8400-e29b-41d4-a716-446655440000'
const validUserId = '550e8400-e29b-41d4-a716-446655440001'

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
    async add(_data: AddUserLoginParams & { passwordHash: string }): Promise<LoginModel> {
      return Promise.resolve({
        id: Id.create(validLoginId),
        userId: Id.create(validUserId),
        password: 'hashed_password',
        role: UserRole.create('admin') as UserRole,
        status: UserStatus.create('active') as UserStatus
      })
    }
  }
  return new AddLoginRepositoryStub()
}

interface SutTypes {
  sut: DbAddUserLogin
  hasherStub: Hasher
  addLoginRepositoryStub: AddLoginRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addLoginRepositoryStub = makeAddLoginRepository()
  const sut = new DbAddUserLogin(hasherStub, addLoginRepositoryStub)
  return {
    sut,
    hasherStub,
    addLoginRepositoryStub
  }
}

describe('DbAddUserLogin UseCase', () => {
  const fakeLoginData: AddUserLoginParams = {
    userId: Id.create(validUserId),
    password: 'any_password',
    role: UserRole.create('admin') as UserRole,
    status: UserStatus.create('active') as UserStatus
  }

  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    await sut.add(fakeLoginData)
    expect(hashSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddLoginRepository with correct values', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')
    await sut.add(fakeLoginData)
    expect(addSpy).toHaveBeenCalledWith({
      ...fakeLoginData,
      passwordHash: 'hashed_password'
    })
  })

  test('Should throw if AddLoginRepository throws', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    jest.spyOn(addLoginRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(fakeLoginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return a login on success', async () => {
    const { sut } = makeSut()
    const login = await sut.add(fakeLoginData)
    expect(login).toEqual({
      id: expect.any(Object), // Id instance
      userId: expect.any(Object),
      password: 'hashed_password',
      role: expect.any(Object),
      status: expect.any(Object)
    })
    expect(login.id.value).toBe(validLoginId)
    expect(login.userId.value).toBe(validUserId)
    expect(login.role.value).toBe('ADMIN')
    expect(login.status.value).toBe('ACTIVE')
  })
})
