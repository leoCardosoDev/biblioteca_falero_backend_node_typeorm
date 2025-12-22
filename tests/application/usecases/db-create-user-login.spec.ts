import { DbCreateUserLogin } from '@/application/usecases/db-create-user-login'
import { CreateUserLoginRepository } from '@/application/protocols/db/create-user-login-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { CreateUserLoginParams } from '@/domain/usecases/create-user-login'
import { LoginModel } from '@/domain/models/login'

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(_value: string): Promise<string> {
      return Promise.resolve('hashed_password')
    }
  }
  return new HasherStub()
}

const makeCreateUserLoginRepository = (): CreateUserLoginRepository => {
  class CreateUserLoginRepositoryStub implements CreateUserLoginRepository {
    async create(_data: CreateUserLoginParams): Promise<LoginModel> {
      return Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        password: 'hashed_password',
        role: 'any_role',
        accessToken: 'any_token'
      })
    }
  }
  return new CreateUserLoginRepositoryStub()
}

interface SutTypes {
  sut: DbCreateUserLogin
  hasherStub: Hasher
  createUserLoginRepositoryStub: CreateUserLoginRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const createUserLoginRepositoryStub = makeCreateUserLoginRepository()
  const sut = new DbCreateUserLogin(hasherStub, createUserLoginRepositoryStub)
  return {
    sut,
    hasherStub,
    createUserLoginRepositoryStub
  }
}

describe('DbCreateUserLogin UseCase', () => {
  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    const loginData = {
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    await sut.create(loginData)
    expect(hashSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(Promise.reject(new Error()))
    const loginData = {
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    const promise = sut.create(loginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call CreateUserLoginRepository with correct values', async () => {
    const { sut, createUserLoginRepositoryStub } = makeSut()
    const createSpy = jest.spyOn(createUserLoginRepositoryStub, 'create')
    const loginData = {
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    await sut.create(loginData)
    expect(createSpy).toHaveBeenCalledWith({
      password: 'hashed_password',
      userId: 'valid_user_id'
    })
  })

  test('Should throw if CreateUserLoginRepository throws', async () => {
    const { sut, createUserLoginRepositoryStub } = makeSut()
    jest.spyOn(createUserLoginRepositoryStub, 'create').mockReturnValueOnce(Promise.reject(new Error()))
    const loginData = {
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    const promise = sut.create(loginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return a Login on success', async () => {
    const { sut } = makeSut()
    const loginData = {
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    const login = await sut.create(loginData)
    expect(login).toEqual({
      id: 'any_id',
      userId: 'any_user_id',
      password: 'hashed_password',
      role: 'any_role',
      accessToken: 'any_token'
    })
  })
})
