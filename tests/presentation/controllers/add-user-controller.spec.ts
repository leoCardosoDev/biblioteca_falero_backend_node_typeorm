import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { Validation } from '@/presentation/protocols/validation'
import { ServerError, MissingParamError } from '@/presentation/errors'

const makeAddUser = (): AddUser => {
  class AddUserStub implements AddUser {
    async add(_data: AddUserParams): Promise<UserModel> {
      const fakeUser: UserModel = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        rg: 'valid_rg',
        cpf: 'valid_cpf'
      }
      return Promise.resolve(fakeUser)
    }
  }
  return new AddUserStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: unknown): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

interface SutTypes {
  sut: AddUserController
  addUserStub: AddUser
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addUserStub = makeAddUser()
  const validationStub = makeValidation()
  const sut = new AddUserController(validationStub, addUserStub)
  return {
    sut,
    addUserStub,
    validationStub
  }
}

const makeFakeRequest = () => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    rg: 'any_rg',
    cpf: 'any_cpf'
  }
})

describe('AddUser Controller', () => {
  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('any_field'))
  })

  test('Should call AddUser with correct values', async () => {
    const { sut, addUserStub } = makeSut()
    const addSpy = jest.spyOn(addUserStub, 'add')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 500 if AddUser throws', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: 'valid_rg',
      cpf: 'valid_cpf'
    })
  })
})
