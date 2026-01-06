import { DbAddUser } from '@/application/usecases/db-add-user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { UserModel } from '@/domain/models/user'
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
import { GetOrCreateGeoEntityService, GeoIdsDTO, AddressDTO } from '@/domain/services/geo/get-or-create-geo-entity-service'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('valid_name') as Name,
  email: Email.create('valid_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
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

class GetOrCreateGeoEntityServiceSpy {
  params: AddressDTO | undefined
  result: GeoIdsDTO = {
    stateId: 'any_state_id',
    cityId: 'any_city_id',
    neighborhoodId: 'any_neighborhood_id'
  }

  async perform(dto: AddressDTO): Promise<GeoIdsDTO> {
    this.params = dto
    return this.result
  }
}

interface SutTypes {
  sut: DbAddUser
  addUserRepositoryStub: AddUserRepository
  loadUserByEmailRepositoryStub: LoadUserByEmailRepository
  loadUserByCpfRepositoryStub: LoadUserByCpfRepository
  saveDomainEventRepositoryStub: SaveDomainEventRepository
  getOrCreateGeoEntityServiceSpy: GetOrCreateGeoEntityServiceSpy
}

const makeSut = (): SutTypes => {
  const addUserRepositoryStub = makeAddUserRepository()
  const loadUserByEmailRepositoryStub = makeLoadUserByEmailRepository()
  const loadUserByCpfRepositoryStub = makeLoadUserByCpfRepository()
  const saveDomainEventRepositoryStub = makeSaveDomainEventRepository()
  const getOrCreateGeoEntityServiceSpy = new GetOrCreateGeoEntityServiceSpy()
  const sut = new DbAddUser(
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub,
    saveDomainEventRepositoryStub,
    getOrCreateGeoEntityServiceSpy as unknown as GetOrCreateGeoEntityService
  )
  return {
    sut,
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub,
    saveDomainEventRepositoryStub,
    getOrCreateGeoEntityServiceSpy
  }
}

const makeFakeUserData = (): AddUserParams => ({
  name: Name.create('valid_name') as Name,
  email: Email.create('valid_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  gender: 'any_gender',
  status: UserStatus.create('ACTIVE') as UserStatus
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
      email: userData.email,
      name: userData.name
    }))
  })

  test('Should throw if AddUserRepository throws', async () => {
    const { sut, addUserRepositoryStub } = makeSut()
    jest.spyOn(addUserRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const promise = sut.add(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  test('Should call GetOrCreateGeoEntityService if address is provided without IDs', async () => {
    const { sut, getOrCreateGeoEntityServiceSpy } = makeSut()
    const userData = makeFakeUserData()
    userData.address = {
      street: 'any_street',
      number: '123',
      zipCode: '12345678',
      city: 'any_city',
      neighborhood: 'any_neighborhood',
      state: 'SP'
    }
    await sut.add(userData)
    expect(getOrCreateGeoEntityServiceSpy.params).toEqual({
      uf: 'SP',
      city: 'any_city',
      neighborhood: 'any_neighborhood'
    })
  })

  test('Should NOT call GetOrCreateGeoEntityService if address has IDs', async () => {
    const { sut, getOrCreateGeoEntityServiceSpy } = makeSut()
    const userData = makeFakeUserData()
    userData.address = {
      street: 'any_street',
      number: '123',
      zipCode: '12345678',
      cityId: 'any_id',
      neighborhoodId: 'any_id'
    }
    const executeSpy = jest.spyOn(getOrCreateGeoEntityServiceSpy, 'perform')
    await sut.add(userData)
    expect(executeSpy).not.toHaveBeenCalled()
  })

  test('Should return Error if Address creation fails (e.g. invalid zip)', async () => {
    const { sut } = makeSut()
    const userData = makeFakeUserData()
    userData.address = {
      street: 'any_street',
      number: '123',
      zipCode: 'invalid', // invalid zip
      cityId: 'any_id',
      neighborhoodId: 'any_id'
    }
    const response = await sut.add(userData)
    expect(response).toBeInstanceOf(Error)
  })

  test('Should call DomainEvents with correct values', async () => {
    const { sut, saveDomainEventRepositoryStub } = makeSut()
    const markSpy = jest.spyOn(DomainEvents, 'markAggregateForDispatch')
    const dispatchSpy = jest.spyOn(DomainEvents, 'dispatchEventsForAggregate')
    const userData = makeFakeUserData()
    const fakeUser = makeFakeUser()
    await sut.add(userData)
    expect(markSpy).toHaveBeenCalledWith(fakeUser.id.value, expect.objectContaining({
      aggregateId: fakeUser.id.value,
      type: 'UserCreated',
      payload: {
        userId: fakeUser.id.value,
        email: fakeUser.email.value
      }
    }))
    expect(dispatchSpy).toHaveBeenCalledWith(fakeUser.id.value, saveDomainEventRepositoryStub)
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const account = await sut.add(makeFakeUserData())
    expect(account).toEqual(makeFakeUser())
  })

  test('Should return Error if Address has no IDs and no Names (GeoService skipped)', async () => {
    const { sut, getOrCreateGeoEntityServiceSpy } = makeSut()
    const userData = makeFakeUserData()
    userData.address = {
      street: 'any_street',
      number: '123',
      zipCode: '12345678',
      // No IDs, No Names
    } as AddUserParams['address']
    const executeSpy = jest.spyOn(getOrCreateGeoEntityServiceSpy, 'perform')
    const response = await sut.add(userData)
    expect(executeSpy).not.toHaveBeenCalled()
    // It should fail because neighborhoodId is required and become ''
    expect(response).toBeInstanceOf(Error)
  })
})
