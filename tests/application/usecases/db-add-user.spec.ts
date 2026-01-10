import { DbAddUser } from '@/application/usecases/db-add-user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { User, UserModel } from '@/domain/models/user'
import { AddUserParams, AddUserRepoParams } from '@/domain/usecases/add-user'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError, CpfInUseError } from '@/domain/errors'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { UserStatus } from '@/domain/value-objects/user-status'
import { DomainEvents, SaveDomainEventRepository } from '@/domain/events/domain-events'
import { InvalidNameError, InvalidEmailError, InvalidRgError, InvalidUserStatusError } from '@/domain/errors'
import { InvalidCpfError } from '@/domain/errors/invalid-cpf-error'
import { AddressResolutionProtocol } from '@/application/services/address/address-resolution-service'
import { Address } from '@/domain/value-objects/address'

const makeFakeUser = (): User => User.create({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('valid_name') as Name,
  email: Email.create('valid_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25') as Cpf,
  gender: 'any_gender',
  version: 1,
  status: UserStatus.create('ACTIVE') as UserStatus
})

const makeLoadUserByEmailRepository = (): LoadUserByEmailRepository => {
  class LoadUserByEmailRepositoryStub implements LoadUserByEmailRepository {
    async loadByEmail(_email: string): Promise<UserModel | undefined> {
      return Promise.resolve(undefined)
    }
  }
  return new LoadUserByEmailRepositoryStub()
}

const makeLoadUserByCpfRepository = (): LoadUserByCpfRepository => {
  class LoadUserByCpfRepositoryStub implements LoadUserByCpfRepository {
    async loadByCpf(_cpf: string): Promise<UserModel | undefined> {
      return Promise.resolve(undefined)
    }
  }
  return new LoadUserByCpfRepositoryStub()
}

const makeAddUserRepository = (): AddUserRepository => {
  class AddUserRepositoryStub implements AddUserRepository {
    async add(_data: AddUserRepoParams): Promise<UserModel> {
      return Promise.resolve(makeFakeUser())
    }
  }
  return new AddUserRepositoryStub()
}

const makeSaveDomainEventRepository = (): SaveDomainEventRepository => {
  class SaveDomainEventRepositoryStub implements SaveDomainEventRepository {
    async save(_event: unknown): Promise<void> {
      return Promise.resolve()
    }
  }
  return new SaveDomainEventRepositoryStub()
}

const makeAddressResolutionService = (): AddressResolutionProtocol => {
  class AddressResolutionServiceStub implements AddressResolutionProtocol {
    async resolve(_addressData: AddUserParams['address']): Promise<Address | undefined | Error> {
      return Promise.resolve(Address.create({
        street: 'any_street',
        number: '123',
        zipCode: '12345678',
        neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440003'),
        cityId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
        stateId: Id.create('550e8400-e29b-41d4-a716-446655440001')
      }))
    }
  }
  return new AddressResolutionServiceStub()
}

interface SutTypes {
  sut: DbAddUser
  addUserRepositoryStub: AddUserRepository
  loadUserByEmailRepositoryStub: LoadUserByEmailRepository
  loadUserByCpfRepositoryStub: LoadUserByCpfRepository
  saveDomainEventRepositoryStub: SaveDomainEventRepository
  addressResolutionServiceStub: AddressResolutionProtocol
}

const makeSut = (): SutTypes => {
  const addUserRepositoryStub = makeAddUserRepository()
  const loadUserByEmailRepositoryStub = makeLoadUserByEmailRepository()
  const loadUserByCpfRepositoryStub = makeLoadUserByCpfRepository()
  const saveDomainEventRepositoryStub = makeSaveDomainEventRepository()
  const addressResolutionServiceStub = makeAddressResolutionService()
  const sut = new DbAddUser(
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub,
    saveDomainEventRepositoryStub,
    addressResolutionServiceStub
  )
  return {
    sut,
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub,
    saveDomainEventRepositoryStub,
    addressResolutionServiceStub
  }
}

const makeFakeUserData = (): AddUserParams => ({
  name: 'valid_name',
  email: 'valid_email@mail.com',
  rg: '123456789',
  cpf: '529.982.247-25',
  gender: 'any_gender',
  status: 'ACTIVE'
})

describe('DbAddUser UseCase', () => {
  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail')
    await sut.add(makeFakeUserData())
    expect(loadSpy).toHaveBeenCalledWith('valid_email@mail.com')
  })

  test('Should return EmailInUseError if LoadUserByEmailRepository returns an account', async () => {
    const { sut, loadUserByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(makeFakeUser()))
    const response = await sut.add(makeFakeUserData())
    expect(response).toEqual(new EmailInUseError())
  })

  test('Should call LoadUserByCpfRepository with correct cpf', async () => {
    const { sut, loadUserByCpfRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf')
    await sut.add(makeFakeUserData())
    expect(loadSpy).toHaveBeenCalledWith('52998224725')
  })

  test('Should return CpfInUseError if LoadUserByCpfRepository returns an account', async () => {
    const { sut, loadUserByCpfRepositoryStub } = makeSut()
    jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf').mockReturnValueOnce(Promise.resolve(makeFakeUser()))
    const response = await sut.add(makeFakeUserData())
    expect(response).toEqual(new CpfInUseError())
  })

  test('Should call AddUserRepository with correct values', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addUserRepositoryStub, 'add')
    const userData = makeFakeUserData()
    await sut.add(userData)
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      email: expect.objectContaining({ value: userData.email }),
      name: expect.objectContaining({ value: userData.name })
    }))
  })

  test('Should throw if AddUserRepository throws', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    jest.spyOn(addUserRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddressResolutionService with correct values', async () => {
    const { sut, addressResolutionServiceStub } = makeSut()
    const resolveSpy = jest.spyOn(addressResolutionServiceStub, 'resolve')
    const userData = makeFakeUserData()
    userData.address = {
      street: 'any_street',
      number: '123',
      zipCode: '12345678'
    }
    await sut.add(userData)
    expect(resolveSpy).toHaveBeenCalledWith(userData.address)
  })

  test('Should return undefined address if AddressResolutionService returns undefined', async () => {
    const { sut, addressResolutionServiceStub } = makeSut()
    jest.spyOn(addressResolutionServiceStub, 'resolve').mockReturnValueOnce(Promise.resolve(undefined))
    const userData = makeFakeUserData()
    const result = await sut.add(userData) as User
    expect(result.address).toBeUndefined()
  })

  test('Should return Error if AddressResolutionService returns Error', async () => {
    const { sut, addressResolutionServiceStub } = makeSut()
    jest.spyOn(addressResolutionServiceStub, 'resolve').mockReturnValueOnce(Promise.resolve(new Error('Address Error')))
    const userData = makeFakeUserData()
    const result = await sut.add(userData)
    expect(result).toEqual(new Error('Address Error'))
  })


  test('Should call DomainEvents with correct values', async () => {
    const { sut, saveDomainEventRepositoryStub } = makeSut()
    const markSpy = jest.spyOn(DomainEvents, 'markAggregateForDispatch')
    const dispatchSpy = jest.spyOn(DomainEvents, 'dispatchEventsForAggregate')
    const userData = makeFakeUserData()

    // Capture the result to get the generated ID
    const result = await sut.add(userData) as User

    expect(markSpy).toHaveBeenCalledWith(result.id.value, expect.objectContaining({
      aggregateId: result.id.value,
      type: 'UserCreated',
      payload: {
        userId: result.id.value,
        email: result.email.value
      }
    }))
    expect(dispatchSpy).toHaveBeenCalledWith(result.id.value, saveDomainEventRepositoryStub)
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const account = await sut.add(makeFakeUserData()) as User
    expect(account).toBeInstanceOf(User)
    expect(account.email.value).toEqual('valid_email@mail.com')
  })

  test('Should return InvalidParamError if name is invalid', async () => {
    const { sut } = makeSut()
    const userData = makeFakeUserData()
    userData.name = 'a'
    const response = await sut.add(userData)
    expect(response).toEqual(new InvalidNameError('a'))
  })

  test('Should return InvalidParamError if email is invalid', async () => {
    const { sut } = makeSut()
    const userData = makeFakeUserData()
    userData.email = 'invalid_email'
    const response = await sut.add(userData)
    expect(response).toEqual(new InvalidEmailError())
  })

  test('Should return InvalidParamError if rg is invalid', async () => {
    const { sut } = makeSut()
    const userData = makeFakeUserData()
    userData.rg = 'invalid_rg'
    const response = await sut.add(userData)
    expect(response).toEqual(new InvalidRgError('invalid_rg'))
  })

  test('Should return InvalidParamError if cpf is invalid', async () => {
    const { sut } = makeSut()
    const userData = makeFakeUserData()
    userData.cpf = 'invalid_cpf'
    const response = await sut.add(userData)
    expect(response).toEqual(new InvalidCpfError())
  })

  test('Should return InvalidParamError if status is invalid', async () => {
    const { sut } = makeSut()
    const userData = makeFakeUserData()
    userData.status = 'invalid_status'
    const response = await sut.add(userData)
    expect(response).toEqual(new InvalidUserStatusError())
  })
})
