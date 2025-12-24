import { UpdateUserController } from '@/presentation/controllers/user/update-user-controller'
import { UpdateUser, UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { ok, serverError, badRequest } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'

const makeFakeUser = (): UserModel => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@mail.com',
  rg: 'any_rg',
  cpf: 'any_cpf',
  dataNascimento: 'any_date'
})

const makeUpdateUser = (): UpdateUser => {
  class UpdateUserStub implements UpdateUser {
    async update(_userData: UpdateUserParams): Promise<UserModel> {
      return await new Promise(resolve => resolve(makeFakeUser()))
    }
  }
  return new UpdateUserStub()
}

interface SutTypes {
  sut: UpdateUserController
  updateUserStub: UpdateUser
}

const makeSut = (): SutTypes => {
  const updateUserStub = makeUpdateUser()
  const sut = new UpdateUserController(updateUserStub)
  return {
    sut,
    updateUserStub
  }
}

describe('UpdateUser Controller', () => {
  test('Should return 400 if no id is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: { name: 'any_name' }
    })
    expect(httpResponse).toEqual(badRequest(new MissingParamError('id')))
  })

  test('Should call UpdateUser with correct values', async () => {
    const { sut, updateUserStub } = makeSut()
    const updateSpy = jest.spyOn(updateUserStub, 'update')
    const httpRequest = {
      params: { id: 'any_id' },
      body: { name: 'updated_name' }
    }
    await sut.handle(httpRequest)
    expect(updateSpy).toHaveBeenCalledWith({
      id: 'any_id',
      name: 'updated_name'
    })
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      params: { id: 'any_id' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(ok(makeFakeUser()))
  })

  test('Should return 500 if UpdateUser throws', async () => {
    const { sut, updateUserStub } = makeSut()
    jest.spyOn(updateUserStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      params: { id: 'any_id' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
