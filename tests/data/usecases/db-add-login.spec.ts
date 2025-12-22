import { DbAddLogin } from '@/data/usecases/add-login/db-add-login'
import { AddLoginRepository } from '@/data/protocols/db/add-login-repository'
import { Hasher } from '@/data/protocols/cryptography/hasher'
import { AddLoginParams } from '@/domain/usecases/add-login'
import { LoginModel } from '@/domain/models/login'

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
    async add(_loginData: AddLoginParams): Promise<LoginModel> {
      return Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        email: 'any_email@mail.com',
        password: 'hashed_password',
        role: 'any_role',
        accessToken: 'any_token'
      })
    }
  }
  return new AddLoginRepositoryStub()
}

interface SutTypes {
  sut: DbAddLogin
  hasherStub: Hasher
  addLoginRepositoryStub: AddLoginRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addLoginRepositoryStub = makeAddLoginRepository()
  const sut = new DbAddLogin(hasherStub, addLoginRepositoryStub)
  return {
    sut,
    hasherStub,
    addLoginRepositoryStub
  }
}

describe('DbAddLogin UseCase', () => {
  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    const loginData = {
      email: 'any_email@mail.com',
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    await sut.add(loginData)
    expect(hashSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(Promise.reject(new Error()))
    const loginData = {
      email: 'any_email@mail.com',
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    const promise = sut.add(loginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddLoginRepository with correct values', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')
    const loginData = {
      email: 'any_email@mail.com',
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    await sut.add(loginData)
    expect(addSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'hashed_password',
      userId: 'valid_user_id'
    })
  })

  test('Should throw if AddLoginRepository throws', async () => {
    const { sut, addLoginRepositoryStub } = makeSut()
    jest.spyOn(addLoginRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const loginData = {
      email: 'any_email@mail.com',
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    const promise = sut.add(loginData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return a Login on success', async () => {
    const { sut } = makeSut()
    const loginData = {
      email: 'any_email@mail.com',
      password: 'valid_password',
      userId: 'valid_user_id'
    }
    const login = await sut.add(loginData)
    expect(login).toEqual({
      id: 'any_id',
      userId: 'any_user_id',
      email: 'any_email@mail.com',
      password: 'hashed_password',
      role: 'any_role',
      accessToken: 'any_token'
    })
  })
})
