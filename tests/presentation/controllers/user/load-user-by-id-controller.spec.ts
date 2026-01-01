import { LoadUserByIdController } from '@/presentation/controllers/user/load-user-by-id-controller'
import { LoadUserById } from '@/domain/usecases/load-user-by-id'
import { UserModel } from '@/domain/models/user'
import { HttpRequest } from '@/presentation/protocols/http'
import { Id } from '@/domain/value-objects/id'
import { Name } from '@/domain/value-objects/name'
import { Email } from '@/domain/value-objects/email'
import { Rg } from '@/domain/value-objects/rg'
import { Cpf } from '@/domain/value-objects/cpf'
// removed BirthDate import
import { UserRole } from '@/domain/value-objects/user-role'
import { UserStatus } from '@/domain/value-objects/user-status'
import { UserWithLogin } from '@/domain/usecases/load-users'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('any_name') as Name,
  email: Email.create('any_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  gender: 'male'
})

const fakeUserById = makeFakeUser()

const makeLoadUserById = (): LoadUserById => {
  class LoadUserByIdStub implements LoadUserById {
    async load(_id: string): Promise<UserWithLogin | null> {
      return Promise.resolve(fakeUserById)
    }
  }
  return new LoadUserByIdStub()
}

interface SutTypes {
  sut: LoadUserByIdController
  loadUserByIdStub: LoadUserById
}

const makeSut = (): SutTypes => {
  const loadUserByIdStub = makeLoadUserById()
  const sut = new LoadUserByIdController(loadUserByIdStub)
  return {
    sut,
    loadUserByIdStub
  }
}

const mockRequest = (): HttpRequest => ({
  params: {
    id: '550e8400-e29b-41d4-a716-446655440000'
  }
})

describe('LoadUserById Controller', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should call LoadUserById with correct id', async () => {
    const { sut, loadUserByIdStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByIdStub, 'load')
    await sut.handle(mockRequest())
    expect(loadSpy).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
  })

  test('Should return 404 if LoadUserById returns null', async () => {
    const { sut, loadUserByIdStub } = makeSut()
    jest.spyOn(loadUserByIdStub, 'load').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse.statusCode).toBe(404)
    expect(httpResponse.body).toEqual(expect.objectContaining({
      error: expect.objectContaining({
        code: 'NOT_FOUND',
        message: 'Resource not found'
      })
    }))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'male',
      address: undefined,
      login: null
    })
  })

  test('Should return 200 on success if address is provided', async () => {
    const { sut, loadUserByIdStub } = makeSut()
    const userWithAddress: UserWithLogin = {
      ...makeFakeUser(),
      address: {
        street: 'any_street',
        number: 'any_number',
        complement: 'any_complement',
        neighborhoodId: 'any_neighborhood',
        cityId: 'any_city',
        zipCode: 'any_zipCode'
      }
    }
    jest.spyOn(loadUserByIdStub, 'load').mockResolvedValueOnce(userWithAddress)
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'male',
      address: {
        street: 'any_street',
        number: 'any_number',
        complement: 'any_complement',
        neighborhoodId: 'any_neighborhood',
        cityId: 'any_city',
        zipCode: 'any_zipCode'
      },
      login: null
    })
  })

  test('Should return 200 on success if login data is provided', async () => {
    const { sut, loadUserByIdStub } = makeSut()
    const userWithLogin: UserWithLogin = {
      ...makeFakeUser(),
      login: {
        role: UserRole.create('LIBRARIAN') as UserRole,
        status: UserStatus.create('active') as UserStatus
      }
    }
    jest.spyOn(loadUserByIdStub, 'load').mockResolvedValueOnce(userWithLogin)
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'male',
      address: undefined,
      login: {
        role: 'LIBRARIAN',
        status: 'active'
      }
    })
  })

  test('Should return 500 if LoadUserById throws', async () => {
    const { sut, loadUserByIdStub } = makeSut()
    const error = new Error('server_error')
    jest.spyOn(loadUserByIdStub, 'load').mockRejectedValueOnce(error)
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(expect.objectContaining({
      error: expect.objectContaining({
        code: 'INTERNAL_ERROR'
      })
    }))
  })
})

