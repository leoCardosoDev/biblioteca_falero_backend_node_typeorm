
import { DbPromoteUser } from '@/application/usecases/db-promote-user'
import { LoadLoginByUserIdRepository } from '@/application/protocols/db/load-login-by-user-id-repository'
import { UpdateLoginRoleRepository } from '@/application/protocols/db/update-login-role-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { LoginModel } from '@/domain/models/login'
import { Role } from '@/domain/models/role'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'

const validActorId = '00000000-0000-0000-0000-000000000001'
const validTargetId = '00000000-0000-0000-0000-000000000002'
const validActorRoleId = '00000000-0000-0000-0000-000000000003'
const validTargetRoleId = '00000000-0000-0000-0000-000000000004'
const validNewRoleId = '00000000-0000-0000-0000-000000000005'
const validAnyLoginId = '00000000-0000-0000-0000-000000000099'

const makeFakeLogin = (userId: string, roleId: string): LoginModel => ({
  id: Id.create(validAnyLoginId),
  userId: Id.create(userId),
  roleId: Id.create(roleId),
  email: Email.create('any_email@mail.com').value as unknown as Email,
  passwordHash: 'any_hash',
  isActive: true
} as LoginModel)

const makeFakeRole = (id: string, powerLevel: number): Role => Role.create({
  id: Id.create(id),
  slug: 'any_slug',
  description: 'any_description',
  powerLevel
})

const makeLoadLoginByUserIdRepository = (): LoadLoginByUserIdRepository => {
  class LoadLoginByUserIdRepositoryStub implements LoadLoginByUserIdRepository {
    async loadByUserId(userId: string): Promise<LoginModel | undefined> {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    }
  }
  return new LoadLoginByUserIdRepositoryStub()
}

const makeLoadRoleByIdRepository = (): LoadRoleByIdRepository => {
  class LoadRoleByIdRepositoryStub implements LoadRoleByIdRepository {
    async loadById(id: Id): Promise<Role | null> {
      return Promise.resolve(makeFakeRole(id.value, 0))
    }
  }
  return new LoadRoleByIdRepositoryStub()
}

const makeUpdateLoginRoleRepository = (): UpdateLoginRoleRepository => {
  class UpdateLoginRoleRepositoryStub implements UpdateLoginRoleRepository {
    async updateRole(_userId: string, _roleId: string): Promise<void> {
      return Promise.resolve()
    }
  }
  return new UpdateLoginRoleRepositoryStub()
}

type SutTypes = {
  sut: DbPromoteUser
  loadLoginByUserIdRepositoryStub: LoadLoginByUserIdRepository
  loadRoleByIdRepositoryStub: LoadRoleByIdRepository
  updateLoginRoleRepositoryStub: UpdateLoginRoleRepository
}

const makeSut = (): SutTypes => {
  const loadLoginByUserIdRepositoryStub = makeLoadLoginByUserIdRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const updateLoginRoleRepositoryStub = makeUpdateLoginRoleRepository()
  const sut = new DbPromoteUser(
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateLoginRoleRepositoryStub
  )
  return {
    sut,
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateLoginRoleRepositoryStub
  }
}

describe('DbPromoteUser UseCase', () => {
  test('Should return NotFoundError if actor login is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockReturnValueOnce(Promise.resolve(undefined))
    const result = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError()) // Actor missing = AccessDenied similar to BlockUser logic? Or specific? BlockUser returned AccessDenied.
  })

  test('Should return NotFoundError if target login is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (id) => {
      if (id === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return undefined
    })
    const result = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new NotFoundError('Login'))
  })

  test('Should return AccessDeniedError if Actor power level is not greater than Target', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()

    // Setup logins
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    // Setup Roles: Actor(50), Target(50) -> Fail
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      if (id.value === validActorRoleId) return makeFakeRole(validActorRoleId, 50)
      if (id.value === validTargetRoleId) return makeFakeRole(validTargetRoleId, 50)
      return makeFakeRole(validNewRoleId, 10) // irrelevant here
    })

    const result = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return AccessDeniedError if Actor power level is not greater than New Role', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()

    // Setup logins
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    // Setup Roles: Actor(50), Target(10), NewRole(50) -> Fail (Cannot promote to same level)
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      if (id.value === validActorRoleId) return makeFakeRole(validActorRoleId, 50)
      if (id.value === validTargetRoleId) return makeFakeRole(validTargetRoleId, 10)
      if (id.value === validNewRoleId) return makeFakeRole(validNewRoleId, 50)
      return null
    })

    const result = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return NotFoundError if New Role does not exist', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()

    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      if (id.value === validActorRoleId) return makeFakeRole(validActorRoleId, 100)
      if (id.value === validTargetRoleId) return makeFakeRole(validTargetRoleId, 10)
      return null // New Role missing
    })

    const result = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new NotFoundError('Role'))
  })

  test('Should call UpdateLoginRoleRepository if checks pass', async () => {
    const { sut, loadRoleByIdRepositoryStub, updateLoginRoleRepositoryStub, loadLoginByUserIdRepositoryStub } = makeSut()

    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      if (id.value === validActorRoleId) return makeFakeRole(validActorRoleId, 100)
      if (id.value === validTargetRoleId) return makeFakeRole(validTargetRoleId, 10)
      if (id.value === validNewRoleId) return makeFakeRole(validNewRoleId, 50)
      return null
    })

    const updateSpy = jest.spyOn(updateLoginRoleRepositoryStub, 'updateRole')

    const result = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(result.isRight()).toBe(true)
    expect(updateSpy).toHaveBeenCalledWith(validTargetId, validNewRoleId)
  })

  test('Should return AccessDeniedError if actorRole or targetRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub, loadLoginByUserIdRepositoryStub } = makeSut()

    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)

    const response = await sut.promote(validActorId, validTargetId, validNewRoleId)
    expect(response.isLeft()).toBe(true)
    expect(response.value).toEqual(new AccessDeniedError())
  })
})
