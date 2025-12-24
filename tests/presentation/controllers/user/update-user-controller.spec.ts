import { UpdateUserController } from '@/presentation/controllers/user/update-user-controller'
import { UpdateUser, UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { serverError, badRequest } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('any_name') as Name,
  email: Email.create('any_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  birthDate: BirthDate.create('1990-01-15') as BirthDate
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
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'updated_name' }
    }
    await sut.handle(httpRequest)
    expect(updateSpy).toHaveBeenCalled()
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      birthDate: '1990-01-15'
    })
  })

  test('Should return 500 if UpdateUser throws', async () => {
    const { sut, updateUserStub } = makeSut()
    jest.spyOn(updateUserStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'updated_name' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
