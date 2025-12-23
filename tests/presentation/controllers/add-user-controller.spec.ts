import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { Validation } from '@/presentation/protocols/validation'
import { ServerError, MissingParamError, EmailInUseError, CpfInUseError } from '@/presentation/errors'

const makeAddUser = (): AddUser => {
  class AddUserStub implements AddUser {
    async add(_data: AddUserParams): Promise<UserModel | Error> {
      const fakeUser: UserModel = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        rg: 'valid_rg',
        cpf: 'valid_cpf',
        dataNascimento: new Date('1990-01-15')
      }
      return Promise.resolve(fakeUser)
    }
  }
  return new AddUserStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: Record<string, unknown>): Error | undefined {
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
    cpf: 'any_cpf',
    dataNascimento: '1990-01-15'
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
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      dataNascimento: new Date('1990-01-15')
    })
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
      cpf: 'valid_cpf',
      dataNascimento: new Date('1990-01-15')
    })
  })

  test('Should return 500 with empty stack if error has no stack', async () => {
    const { sut, addUserStub } = makeSut()
    const errorWithoutStack = new Error()
    errorWithoutStack.stack = undefined
    jest.spyOn(addUserStub, 'add').mockRejectedValueOnce(errorWithoutStack)
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 403 if AddUser returns EmailInUseError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockReturnValueOnce(Promise.resolve(new EmailInUseError()))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(403)
    expect(httpResponse.body).toEqual(new EmailInUseError())
  })

  test('Should return 403 if AddUser returns CpfInUseError', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'add').mockReturnValueOnce(Promise.resolve(new CpfInUseError()))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(403)
    expect(httpResponse.body).toEqual(new CpfInUseError())
  })
})
