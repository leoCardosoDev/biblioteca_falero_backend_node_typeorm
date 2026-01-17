import { DbAddUser } from '@/modules/identity/application/usecases/db-add-user'
import { AddUserRepository } from '@/modules/identity/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/modules/identity/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/modules/identity/application/protocols/db/load-user-by-cpf-repository'

import { User, UserModel } from '@/modules/identity/domain/models/user'
import { AddUserParams, AddUserRepoParams } from '@/modules/identity/domain/usecases/add-user'
import { AddUserOutput } from '@/modules/identity/domain/usecases/add-user-output'
import { ResolveAddress, ResolveAddressInput } from '@/modules/geography/domain/usecases/resolve-address'
import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { IdGenerator } from '@/shared/domain/gateways/id-generator'
import { DomainEvents, SaveDomainEventRepository } from '@/shared/domain/events/domain-events'
import {
  EmailInUseError,
  CpfInUseError,
  InvalidNameError,
  InvalidEmailError,
  InvalidRgError,
  InvalidUserStatusError,
  InvalidCpfError
} from '@/modules/identity/domain/errors'
import { InvalidAddressError } from '@/shared/domain/errors/invalid-address-error'

import { Either, right, left } from '@/shared/application/either'

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

const makeResolveAddress = (): ResolveAddress => {
  class ResolveAddressStub implements ResolveAddress {
    async resolve(_input: ResolveAddressInput): Promise<Either<InvalidAddressError, Address>> {
      const addressOrError = Address.create({
        street: 'any_street',
        number: '123',
        zipCode: '12345678',
        neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440003'),
        cityId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
        stateId: Id.create('550e8400-e29b-41d4-a716-446655440001')
      })
      if (addressOrError instanceof Error) {
        return Promise.resolve(left(addressOrError))
      }
      return Promise.resolve(right(addressOrError))
    }
  }
  return new ResolveAddressStub()
}

const makeIdGenerator = (): IdGenerator => {
  class IdGeneratorStub implements IdGenerator {
    generate(): string {
      return '550e8400-e29b-41d4-a716-446655440000'
    }
  }
  return new IdGeneratorStub()
}

interface SutTypes {
  sut: DbAddUser
  addUserRepositoryStub: AddUserRepository
  loadUserByEmailRepositoryStub: LoadUserByEmailRepository
  loadUserByCpfRepositoryStub: LoadUserByCpfRepository
  saveDomainEventRepositoryStub: SaveDomainEventRepository
  resolveAddressStub: ResolveAddress
  idGeneratorStub: IdGenerator
}

const makeSut = (): SutTypes => {
  const addUserRepositoryStub = makeAddUserRepository()
  const loadUserByEmailRepositoryStub = makeLoadUserByEmailRepository()
  const loadUserByCpfRepositoryStub = makeLoadUserByCpfRepository()
  const saveDomainEventRepositoryStub = makeSaveDomainEventRepository()
  const resolveAddressStub = makeResolveAddress()
  const idGeneratorStub = makeIdGenerator()
  const sut = new DbAddUser(
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub,
    saveDomainEventRepositoryStub,
    resolveAddressStub,
    idGeneratorStub
  )
  return {
    sut,
    addUserRepositoryStub,
    loadUserByEmailRepositoryStub,
    loadUserByCpfRepositoryStub,
    saveDomainEventRepositoryStub,
    resolveAddressStub,
    idGeneratorStub
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
  describe('Input Validation', () => {
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

  describe('Business Rules', () => {
    test('Should return EmailInUseError if LoadUserByEmailRepository returns an account', async () => {
      const { sut, loadUserByEmailRepositoryStub } = makeSut()
      jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(makeFakeUser()))
      const response = await sut.add(makeFakeUserData())
      expect(response).toEqual(new EmailInUseError())
    })

    test('Should return CpfInUseError if LoadUserByCpfRepository returns an account', async () => {
      const { sut, loadUserByCpfRepositoryStub } = makeSut()
      jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf').mockReturnValueOnce(Promise.resolve(makeFakeUser()))
      const response = await sut.add(makeFakeUserData())
      expect(response).toEqual(new CpfInUseError())
    })
  })

  describe('Infrastructure', () => {
    test('Should call LoadUserByEmailRepository with correct email', async () => {
      const { sut, loadUserByEmailRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadUserByEmailRepositoryStub, 'loadByEmail')
      await sut.add(makeFakeUserData())
      expect(loadSpy).toHaveBeenCalledWith('valid_email@mail.com')
    })

    test('Should call LoadUserByCpfRepository with correct cpf', async () => {
      const { sut, loadUserByCpfRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadUserByCpfRepositoryStub, 'loadByCpf')
      await sut.add(makeFakeUserData())
      expect(loadSpy).toHaveBeenCalledWith('52998224725')
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

    test('Should call ResolveAddress with correct values', async () => {
      const { sut, resolveAddressStub } = makeSut()
      const resolveSpy = jest.spyOn(resolveAddressStub, 'resolve')
      const userData = makeFakeUserData()
      userData.address = {
        street: 'any_street',
        number: '123',
        zipCode: '12345678'
      }
      await sut.add(userData)
      expect(resolveSpy).toHaveBeenCalledWith(userData.address)
    })

    test('Should return Error if ResolveAddress returns Error', async () => {
      const { sut, resolveAddressStub } = makeSut()
      const error = new Error('Address Error')
      jest.spyOn(resolveAddressStub, 'resolve').mockReturnValueOnce(Promise.resolve(left(error)))
      const userData = makeFakeUserData()
      userData.address = {
        street: 'any_street',
        number: '123',
        zipCode: '12345678'
      }
      const result = await sut.add(userData)
      expect(result).toBe(error)
      expect(result).toBeInstanceOf(Error)
    })
  })

  describe('Success', () => {
    test('Should call DomainEvents with correct values', async () => {
      const { sut, saveDomainEventRepositoryStub } = makeSut()
      const markSpy = jest.spyOn(DomainEvents, 'markAggregateForDispatch')
      const dispatchSpy = jest.spyOn(DomainEvents, 'dispatchEventsForAggregate')
      const userData = makeFakeUserData()

      // Capture the result to get the generated ID
      const result = await sut.add(userData) as AddUserOutput

      expect(markSpy).toHaveBeenCalledWith(result.id, expect.objectContaining({
        aggregateId: result.id,
        type: 'UserCreated',
        payload: {
          userId: result.id,
          email: result.email
        }
      }))
      expect(dispatchSpy).toHaveBeenCalledWith(result.id, saveDomainEventRepositoryStub)
    })

    test('Should return an account on success', async () => {
      const { sut } = makeSut()
      const account = await sut.add(makeFakeUserData()) as AddUserOutput
      expect(account).toHaveProperty('id')
      expect(account.email).toEqual('valid_email@mail.com')
    })
  })
})
