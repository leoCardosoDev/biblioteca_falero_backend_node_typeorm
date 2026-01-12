
import { DbManageUserAccess } from '@/application/usecases/db-manage-user-access'
import { LoadLoginByUserIdRepository } from '@/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { UpdateLoginRoleRepository } from '@/application/protocols/db/update-login-role-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { UpdateLoginPasswordRepository } from '@/application/protocols/db/update-login-password-repository'
import { UpdateLoginStatusRepository } from '@/application/protocols/db/update-login-status-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'
import { Login, LoginModel } from '@/domain/models/login'
import { Role } from '@/domain/models/role'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { UserStatus, UserStatusEnum } from '@/domain/value-objects/user-status'

const ACTOR_ID = '00000000-0000-0000-0000-000000000001'
const TARGET_ID = '00000000-0000-0000-0000-000000000002'
const ROLE_ID_1 = '00000000-0000-0000-0000-000000000003'
const ROLE_ID_2 = '00000000-0000-0000-0000-000000000004'

const makeFakeLogin = (id: string, roleId: string): LoginModel => Login.create({
  id: Id.create(id),
  userId: Id.create(id),
  roleId: Id.create(roleId),
  email: Email.create('any_email@mail.com'),
  passwordHash: 'any_hash',
  isActive: true
})

const makeFakeRole = (id: string, powerLevel: number): Role => Role.create({
  id: Id.create(id),
  slug: `slug_${id}`,
  description: 'any_desc',
  powerLevel: powerLevel
})

const makeLoadLoginByUserIdRepository = (): LoadLoginByUserIdRepository => {
  class LoadLoginByUserIdRepositoryStub implements LoadLoginByUserIdRepository {
    async loadByUserId(userId: string): Promise<LoginModel | undefined> {
      return Promise.resolve(makeFakeLogin(userId, 'any_role'))
    }
  }
  return new LoadLoginByUserIdRepositoryStub()
}

const makeLoadRoleByIdRepository = (): LoadRoleByIdRepository => {
  class LoadRoleByIdRepositoryStub implements LoadRoleByIdRepository {
    async loadById(id: Id): Promise<Role | null> {
      return Promise.resolve(makeFakeRole(id.value, 10))
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

const makeUpdateUserStatusRepository = (): UpdateUserStatusRepository => {
  class UpdateUserStatusRepositoryStub implements UpdateUserStatusRepository {
    async updateStatus(_userId: string, _status: UserStatus): Promise<void> {
      return Promise.resolve()
    }
  }
  return new UpdateUserStatusRepositoryStub()
}

const makeUpdateLoginPasswordRepository = (): UpdateLoginPasswordRepository => {
  class UpdateLoginPasswordRepositoryStub implements UpdateLoginPasswordRepository {
    async updatePassword(_id: Id, _passwordHash: string): Promise<void> {
      return Promise.resolve()
    }
  }
  return new UpdateLoginPasswordRepositoryStub()
}

const makeUpdateLoginStatusRepository = (): UpdateLoginStatusRepository => {
  class UpdateLoginStatusRepositoryStub implements UpdateLoginStatusRepository {
    async updateStatus(_id: Id, _isActive: boolean): Promise<void> {
      return Promise.resolve()
    }
  }
  return new UpdateLoginStatusRepositoryStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(_plaintext: string): Promise<string> {
      return Promise.resolve('hashed_password')
    }
  }
  return new HasherStub()
}

interface SutTypes {
  sut: DbManageUserAccess
  loadLoginByUserIdRepositoryStub: LoadLoginByUserIdRepository
  loadRoleByIdRepositoryStub: LoadRoleByIdRepository
  updateLoginRoleRepositoryStub: UpdateLoginRoleRepository
  updateUserStatusRepositoryStub: UpdateUserStatusRepository
  updateLoginPasswordRepositoryStub: UpdateLoginPasswordRepository
  updateLoginStatusRepositoryStub: UpdateLoginStatusRepository
  hasherStub: Hasher
}

const makeSut = (): SutTypes => {
  const loadLoginByUserIdRepositoryStub = makeLoadLoginByUserIdRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const updateLoginRoleRepositoryStub = makeUpdateLoginRoleRepository()
  const updateUserStatusRepositoryStub = makeUpdateUserStatusRepository()
  const updateLoginPasswordRepositoryStub = makeUpdateLoginPasswordRepository()
  const updateLoginStatusRepositoryStub = makeUpdateLoginStatusRepository()
  const hasherStub = makeHasher()

  const sut = new DbManageUserAccess(
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateLoginRoleRepositoryStub,
    updateUserStatusRepositoryStub,
    updateLoginPasswordRepositoryStub,
    updateLoginStatusRepositoryStub,
    hasherStub
  )

  return {
    sut,
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateLoginRoleRepositoryStub,
    updateUserStatusRepositoryStub,
    updateLoginPasswordRepositoryStub,
    updateLoginStatusRepositoryStub,
    hasherStub
  }
}

describe('DbManageUserAccess UseCase', () => {
  it('should return AccessDenied if actor login is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockReturnValueOnce(Promise.resolve(undefined))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID })
    expect(result.value).toBeInstanceOf(AccessDeniedError)
  })

  it('should return NotFound if target login is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID })
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should return AccessDenied if actor powerLevel <= target powerLevel', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 10)))
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID })
    expect(result.value).toBeInstanceOf(AccessDeniedError)
  })

  it('should succeed to update status if actor > target', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, updateUserStatusRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    const updateSpy = jest.spyOn(updateUserStatusRepositoryStub, 'updateStatus')
    const status = UserStatus.create(UserStatusEnum.BLOCKED) as UserStatus

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID, status })

    expect(result.isRight()).toBe(true)
    expect(updateSpy).toHaveBeenCalledWith(TARGET_ID, status)
  })

  it('should activate login status when password is updated', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, updateLoginStatusRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    const updateSpy = jest.spyOn(updateLoginStatusRepositoryStub, 'updateStatus')

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID, password: 'new_password' })

    expect(result.isRight()).toBe(true)
    // Verify that updateStatus was called with the target Login ID (TARGET_ID used in mock) and true (active)
    expect(updateSpy).toHaveBeenCalledWith(Id.create(TARGET_ID), true)
  })
})
