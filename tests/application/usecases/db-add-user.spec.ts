import { DbAddUser } from '@/application/usecases/db-add-user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { UserModel } from '@/domain/models/user'
import { AddUserParams } from '@/domain/usecases/add-user'

const makeAddUserRepository = (): AddUserRepository => {
  class AddUserRepositoryStub implements AddUserRepository {
    async add(data: AddUserParams): Promise<UserModel> {
      const fakeUser: UserModel = {
        id: 'valid_id',
        name: data.name,
        email: data.email,
        rg: data.rg,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento
      }
      return Promise.resolve(fakeUser)
    }
  }
  return new AddUserRepositoryStub()
}

interface SutTypes {
  sut: DbAddUser
  addUserRepositoryStub: AddUserRepository
}

const makeSut = (): SutTypes => {
  const addUserRepositoryStub = makeAddUserRepository()
  const sut = new DbAddUser(addUserRepositoryStub)
  return {
    sut,
    addUserRepositoryStub
  }
}

describe('DbAddUser UseCase', () => {
  test('Should call AddUserRepository with correct values', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addUserRepositoryStub, 'add')
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    await sut.add(userData)
    expect(addSpy).toHaveBeenCalledWith(userData)
  })

  test('Should throw if AddUserRepository throws', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    jest.spyOn(addUserRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    const promise = sut.add(userData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const userData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    }
    const account = await sut.add(userData)
    expect(account).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    })
  })
})
