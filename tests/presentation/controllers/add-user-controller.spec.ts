import { AddUserController } from '@/presentation/controllers/add-user-controller'
import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { Validation } from '@/presentation/protocols/validation'
import { ServerError, MissingParamError, EmailInUseError, CpfInUseError } from '@/presentation/errors'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { BirthDate } from '@/domain/value-objects/birth-date'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('valid_name') as Name,
  email: Email.create('valid_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  birthDate: BirthDate.create('1990-01-15') as BirthDate
})

const makeAddUser = (): AddUser => {
  class AddUserStub implements AddUser {
    async add(_data: AddUserParams): Promise<UserModel | Error> {
      return Promise.resolve(makeFakeUser())
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
    rg: '123456789',
    cpf: '529.982.247-25',
    birthDate: '1990-01-15'
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
    await sut.handle(makeFakeRequest())
    expect(addSpy).toHaveBeenCalled()
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
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'valid_name',
      email: 'valid_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      birthDate: '1990-01-15'
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

  test('Should return 400 if Email.create throws InvalidEmailError', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'any_name',
        email: 'invalid-email',
        rg: '123456789',
        cpf: '529.982.247-25',
        birthDate: '1990-01-15'
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if Cpf.create throws InvalidCpfError', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        rg: '123456789',
        cpf: '00000000000',
        birthDate: '1990-01-15'
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if Address.create returns error', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        rg: '123456789',
        cpf: '529.982.247-25',
        birthDate: '1990-01-15',
        address: {
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 200 with address if valid address is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        rg: '123456789',
        cpf: '529.982.247-25',
        birthDate: '1990-01-15',
        address: {
          street: 'any_street',
          number: '123',
          neighborhood: 'any_neighborhood',
          city: 'any_city',
          state: 'SP',
          zipCode: '12345678'
        }
      }
    })
    expect(httpResponse.statusCode).toBe(200)
  })

  test('Should return 400 if Name.create returns error', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'a', // Invalid name (too short)
        email: 'valid_email@mail.com',
        rg: '123456789',
        cpf: '529.982.247-25',
        birthDate: '1990-01-15'
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if Rg.create returns error', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        rg: '', // Invalid Rg (empty)
        cpf: '529.982.247-25',
        birthDate: '1990-01-15'
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })

  test('Should return 400 if BirthDate.create returns error', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        name: 'any_name',
        email: 'valid_email@mail.com',
        rg: '123456789',
        cpf: '529.982.247-25',
        birthDate: 'invalid-date' // Invalid BirthDate
      }
    })
    expect(httpResponse.statusCode).toBe(400)
  })
})
