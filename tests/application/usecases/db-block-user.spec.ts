
import { DbBlockUser } from '@/application/usecases/db-block-user'
import { LoadLoginByUserIdRepository } from '@/application/protocols/db/load-login-by-user-id-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { LoginModel } from '@/domain/models/login'
import { Role } from '@/domain/models/role'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { UserStatus } from '@/domain/value-objects/user-status'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'

const validActorId = '00000000-0000-0000-0000-000000000001'
const validTargetId = '00000000-0000-0000-0000-000000000002'
const validActorRoleId = '00000000-0000-0000-0000-000000000003'
const validTargetRoleId = '00000000-0000-0000-0000-000000000004'
const validAnyLoginId = '00000000-0000-0000-0000-000000000099'
const validAnyRoleId = '00000000-0000-0000-0000-000000000088'

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
      return Promise.resolve(makeFakeLogin(userId, validAnyRoleId))
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

const makeUpdateUserStatusRepository = (): UpdateUserStatusRepository => {
  class UpdateUserStatusRepositoryStub implements UpdateUserStatusRepository {
    async updateStatus(_userId: string, _status: UserStatus): Promise<void> {
      return Promise.resolve()
    }
  }
  return new UpdateUserStatusRepositoryStub()
}

type SutTypes = {
  sut: DbBlockUser
  loadLoginByUserIdRepositoryStub: LoadLoginByUserIdRepository
  loadRoleByIdRepositoryStub: LoadRoleByIdRepository
  updateUserStatusRepositoryStub: UpdateUserStatusRepository
}

const makeSut = (): SutTypes => {
  const loadLoginByUserIdRepositoryStub = makeLoadLoginByUserIdRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const updateUserStatusRepositoryStub = makeUpdateUserStatusRepository()
  const sut = new DbBlockUser(
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateUserStatusRepositoryStub
  )
  return {
    sut,
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateUserStatusRepositoryStub
  }
}

describe('DbBlockUser UseCase', () => {
  test('Should call LoadLoginByUserIdRepository with correct values', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
    await sut.block(validActorId, validTargetId)
    expect(loadSpy).toHaveBeenCalledWith(validActorId)
    expect(loadSpy).toHaveBeenCalledWith(validTargetId)
    expect(loadSpy).toHaveBeenCalledWith(validTargetId)
  })

  test('Should return AccessDeniedError if actor login is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockReturnValueOnce(Promise.resolve(undefined))
    const result = await sut.block(validActorId, validTargetId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return NotFoundError if target login is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (id) => {
      if (id === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return undefined
    })
    const result = await sut.block(validActorId, validTargetId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new NotFoundError('Login')) // Assuming BlockUser uses NotFoundError for target
  })

  test('Should return AccessDeniedError if actorRole or targetRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)
    const result = await sut.block(validActorId, validTargetId)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return AccessDeniedError if Actor power level is not greater than Target', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      // Logic: Actor.Role > Target.Role
      // In the implementation, we call LoadRoleById twice.
      // 1. actorRole (from simple mock setup)
      // 2. targetRole 
      // We can distinguish by ID logic in Helper or just return different values by mocking sequentially or by ID input.
      // Since makeFakeLogin uses 'any_role_id', we better customize it.
      return makeFakeRole(id.value, 50)
    })

    const result = await sut.block(validActorId, validTargetId)
    // Both 50 -> Equal -> Fail
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should call UpdateUserStatusRepository if checks pass', async () => {
    const { sut, loadRoleByIdRepositoryStub, updateUserStatusRepositoryStub, loadLoginByUserIdRepositoryStub } = makeSut()

    // Setup logins with specific role IDs we can track
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      if (id.value === validActorRoleId) return makeFakeRole(validActorRoleId, 100)
      return makeFakeRole(validTargetRoleId, 10)
    })

    const updateSpy = jest.spyOn(updateUserStatusRepositoryStub, 'updateStatus')

    const result = await sut.block(validActorId, validTargetId)
    expect(result.isRight()).toBe(true)
    expect(updateSpy).toHaveBeenCalledWith(validTargetId, expect.any(Object)) // UserStatus object
  })

  test('Should return left if UserStatus.create returns an error', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()

    // 1. Setup Logins
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockImplementation(async (userId) => {
      if (userId === validActorId) return makeFakeLogin(validActorId, validActorRoleId)
      return makeFakeLogin(validTargetId, validTargetRoleId)
    })

    // 2. Setup Roles (Actor > Target)
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockImplementation(async (id) => {
      if (id.value === validActorRoleId) return makeFakeRole(validActorRoleId, 100)
      return makeFakeRole(validTargetRoleId, 10)
    })

    // 3. Mock UserStatus failure
    jest.spyOn(UserStatus, 'create').mockReturnValueOnce(new Error('any_error'))

    const response = await sut.block(validActorId, validTargetId)

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(Error)
  })
})
