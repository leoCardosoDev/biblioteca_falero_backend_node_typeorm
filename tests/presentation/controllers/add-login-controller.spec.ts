import { AddLoginController } from '@/presentation/controllers/add-login-controller'
import { Validation } from '@/presentation/protocols'
import { AddLogin, AddLoginParams } from '@/domain/usecases/add-login'
import { LoginModel } from '@/domain/models/login'
import { badRequest, serverError, ok } from '@/presentation/helpers'
import { MissingParamError } from '@/presentation/errors'

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: Record<string, unknown>): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

const makeAddLogin = (): AddLogin => {
  class AddLoginStub implements AddLogin {
    async add(_login: AddLoginParams): Promise<LoginModel> {
      return Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        email: 'any_email@mail.com',
        password: 'any_password',
        role: 'any_role',
        accessToken: 'any_token'
      })
    }
  }
  return new AddLoginStub()
}

interface SutTypes {
  sut: AddLoginController
  validationStub: Validation
  addLoginStub: AddLogin
}

const makeSut = (): SutTypes => {
  const validationStub = makeValidation()
  const addLoginStub = makeAddLogin()
  const sut = new AddLoginController(validationStub, addLoginStub)
  return {
    sut,
    validationStub,
    addLoginStub
  }
}

describe('AddLogin Controller', () => {
  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        userId: 'any_user_id'
      }
    }
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        userId: 'any_user_id'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })

  test('Should call AddLogin with correct values', async () => {
    const { sut, addLoginStub } = makeSut()
    const addSpy = jest.spyOn(addLoginStub, 'add')
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        userId: 'any_user_id'
      }
    }
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 500 if AddLogin throws', async () => {
    const { sut, addLoginStub } = makeSut()
    jest.spyOn(addLoginStub, 'add').mockImplementationOnce(async () => {
      return Promise.reject(new Error())
    })
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        userId: 'any_user_id'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        userId: 'any_user_id'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(ok({
      id: 'any_id',
      userId: 'any_user_id',
      email: 'any_email@mail.com',
      password: 'any_password',
      role: 'any_role',
      accessToken: 'any_token'
    }))
  })
})
