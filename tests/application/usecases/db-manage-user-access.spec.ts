
import { DbManageUserAccess } from '@/application/usecases/db-manage-user-access'
import { LoadLoginByUserIdRepository } from '@/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { LoadRoleBySlugRepository } from '@/application/protocols/db/load-role-by-slug-repository'
import { UpdateLoginRoleRepository } from '@/application/protocols/db/update-login-role-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { AddUserLoginParams } from '@/domain/usecases/add-user-login'
import { UpdateLoginPasswordRepository } from '@/application/protocols/db/update-login-password-repository'
import { UpdateLoginStatusRepository } from '@/application/protocols/db/update-login-status-repository'
import { AddLoginRepository } from '@/application/protocols/db/add-login-repository'
import { LoadUserByIdRepository } from '@/application/protocols/db/load-user-by-id-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'
import { Login, LoginModel } from '@/domain/models/login'
import { Role } from '@/domain/models/role'
import { UserModel } from '@/domain/models/user'
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

const makeLoadRoleBySlugRepository = (): LoadRoleBySlugRepository => {
  class LoadRoleBySlugRepositoryStub implements LoadRoleBySlugRepository {
    async loadBySlug(slug: string): Promise<Role | null> {
      return Promise.resolve(makeFakeRole(`slug_${slug}`, 10))
    }
  }
  return new LoadRoleBySlugRepositoryStub()
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

const makeAddLoginRepository = (): AddLoginRepository => {
  class AddLoginRepositoryStub implements AddLoginRepository {
    async add(data: Omit<AddUserLoginParams, 'role' | 'actorId'> & { passwordHash: string, roleId: Id }): Promise<LoginModel> {
      return Promise.resolve(makeFakeLogin(data.userId.value, data.roleId.value))
    }
  }
  return new AddLoginRepositoryStub()
}

const makeLoadUserByIdRepository = (): LoadUserByIdRepository => {
  class LoadUserByIdRepositoryStub implements LoadUserByIdRepository {
    async loadById(id: string): Promise<UserModel | null> {
      return Promise.resolve({
        id: Id.create(id),
        email: Email.create('any_email@mail.com')
      } as UserModel)
    }
  }
  return new LoadUserByIdRepositoryStub()
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
  loadRoleBySlugRepositoryStub: LoadRoleBySlugRepository
  updateLoginRoleRepositoryStub: UpdateLoginRoleRepository
  updateUserStatusRepositoryStub: UpdateUserStatusRepository
  updateLoginPasswordRepositoryStub: UpdateLoginPasswordRepository
  updateLoginStatusRepositoryStub: UpdateLoginStatusRepository
  addLoginRepositoryStub: AddLoginRepository
  loadUserByIdRepositoryStub: LoadUserByIdRepository
  hasherStub: Hasher
}

const makeSut = (): SutTypes => {
  const loadLoginByUserIdRepositoryStub = makeLoadLoginByUserIdRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const loadRoleBySlugRepositoryStub = makeLoadRoleBySlugRepository()
  const updateLoginRoleRepositoryStub = makeUpdateLoginRoleRepository()
  const updateUserStatusRepositoryStub = makeUpdateUserStatusRepository()
  const updateLoginPasswordRepositoryStub = makeUpdateLoginPasswordRepository()
  const updateLoginStatusRepositoryStub = makeUpdateLoginStatusRepository()
  const addLoginRepositoryStub = makeAddLoginRepository()
  const loadUserByIdRepositoryStub = makeLoadUserByIdRepository()
  const hasherStub = makeHasher()

  const sut = new DbManageUserAccess(
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    loadRoleBySlugRepositoryStub,
    updateLoginRoleRepositoryStub,
    updateUserStatusRepositoryStub,
    updateLoginPasswordRepositoryStub,
    updateLoginStatusRepositoryStub,
    addLoginRepositoryStub,
    loadUserByIdRepositoryStub,
    hasherStub
  )

  return {
    sut,
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    loadRoleBySlugRepositoryStub,
    updateLoginRoleRepositoryStub,
    updateUserStatusRepositoryStub,
    updateLoginPasswordRepositoryStub,
    updateLoginStatusRepositoryStub,
    addLoginRepositoryStub,
    loadUserByIdRepositoryStub,
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

  it('should return NotFound if target login is not found and no password provided', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID })
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should create a new login if target login is not found but password is provided', async () => {
    const {
      sut,
      loadLoginByUserIdRepositoryStub,
      loadRoleByIdRepositoryStub,
      loadUserByIdRepositoryStub,
      addLoginRepositoryStub,
      loadRoleBySlugRepositoryStub
    } = makeSut()

    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))

    jest.spyOn(loadUserByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(TARGET_ID), email: Email.create('any@mail.com') } as UserModel))

    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole('00000000-0000-0000-0000-000000000005', 10)))

    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')

    const result = await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password',
      roleSlug: 'STUDENT'
    })

    expect(result.isRight()).toBe(true)
    expect(addSpy).toHaveBeenCalled()
  })

  it('should return NotFound if target user is not found when creating new login', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadUserByIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))

    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))

    const result = await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password'
    })

    expect(result.value).toBeInstanceOf(NotFoundError)
    expect((result.value as NotFoundError).message).toBe('User not found')
  })

  it('should return NotFound if role is not found when creating new login', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadUserByIdRepositoryStub, loadRoleBySlugRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))

    jest.spyOn(loadUserByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(TARGET_ID), email: Email.create('any@mail.com') } as UserModel))

    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(null))

    const result = await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password',
      roleSlug: 'INVALID_ROLE'
    })

    expect(result.value).toBeInstanceOf(NotFoundError)
    expect((result.value as NotFoundError).message).toBe('Role not found')
  })

  it('should return AccessDenied if actor powerLevel < new role powerLevel when creating new login', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadUserByIdRepositoryStub, loadRoleBySlugRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 10))) // Actor Power 10

    jest.spyOn(loadUserByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(TARGET_ID), email: Email.create('any@mail.com') } as UserModel))

    // New Role Power 20
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(makeFakeRole('00000000-0000-0000-0000-000000000005', 20)))

    const result = await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password',
      roleSlug: 'HIGH_POWER_ROLE'
    })

    expect(result.value).toBeInstanceOf(AccessDeniedError)
  })

  it('should use default role STUDENT and default status ACTIVE if not provided when creating new login', async () => {
    const {
      sut,
      loadLoginByUserIdRepositoryStub,
      loadRoleByIdRepositoryStub,
      loadUserByIdRepositoryStub,
      addLoginRepositoryStub,
      loadRoleBySlugRepositoryStub
    } = makeSut()

    const studentRole = makeFakeRole('00000000-0000-0000-0000-000000000005', 1)
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve({ id: Id.create(TARGET_ID), email: Email.create('any@mail.com') } as UserModel))
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(studentRole))

    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')

    await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password'
      // roleSlug and status not provided
    })

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      roleId: studentRole.id,
      status: expect.objectContaining({ value: 'ACTIVE' })
    }))
  })

  it('should use provided status when creating new login', async () => {
    const {
      sut,
      loadLoginByUserIdRepositoryStub,
      loadRoleByIdRepositoryStub,
      loadUserByIdRepositoryStub,
      addLoginRepositoryStub,
      loadRoleBySlugRepositoryStub
    } = makeSut()

    const status = UserStatus.create('BLOCKED') as UserStatus
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve({ id: Id.create(TARGET_ID), email: Email.create('any@mail.com') } as UserModel))
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(makeFakeRole('00000000-0000-0000-0000-000000000006', 1)))

    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')

    await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password',
      status
    })

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      status
    }))
  })

  it('should default to ACTIVE status if provided status is an error when creating new login', async () => {
    const {
      sut,
      loadLoginByUserIdRepositoryStub,
      loadRoleByIdRepositoryStub,
      loadUserByIdRepositoryStub,
      addLoginRepositoryStub,
      loadRoleBySlugRepositoryStub
    } = makeSut()

    const status = new Error('Invalid status')
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(undefined))
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
    jest.spyOn(loadUserByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve({ id: Id.create(TARGET_ID), email: Email.create('any@mail.com') } as UserModel))
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(makeFakeRole('00000000-0000-0000-0000-000000000007', 1)))

    const addSpy = jest.spyOn(addLoginRepositoryStub, 'add')

    await sut.perform({
      actorId: ACTOR_ID,
      targetId: TARGET_ID,
      password: 'password',
      status: status as unknown as UserStatus
    })

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      status: expect.objectContaining({ value: 'ACTIVE' })
    }))
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

  it('should return AccessDenied if actor role is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(null)) // Actor role missing
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID })
    expect(result.value).toBeInstanceOf(AccessDeniedError)
  })

  it('should return AccessDenied if target role is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 10)))
      .mockReturnValueOnce(Promise.resolve(null)) // Target role missing

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID })
    expect(result.value).toBeInstanceOf(AccessDeniedError)
  })

  it('should return NotFound if role slug is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, loadRoleBySlugRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(null))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID, roleSlug: 'invalidQuery' })
    expect(result.value).toBeInstanceOf(NotFoundError)
    expect((result.value as NotFoundError).message).toBe('Role not found')
  })

  it('should return AccessDenied if actor powerLevel < new role powerLevel', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, loadRoleBySlugRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 50))) // Actor power 50
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    // New role power 60 > Actor power 50
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(makeFakeRole('00000000-0000-0000-0000-000000000005', 60)))

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID, roleSlug: 'validQuery' })
    expect(result.value).toBeInstanceOf(AccessDeniedError)
  })

  it('should succeed to update role if actor powerLevel >= new role powerLevel', async () => {
    const { sut, loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, loadRoleBySlugRepositoryStub, updateLoginRoleRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(ACTOR_ID, ROLE_ID_1)))
      .mockReturnValueOnce(Promise.resolve(makeFakeLogin(TARGET_ID, ROLE_ID_2)))

    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_1, 100)))
      .mockReturnValueOnce(Promise.resolve(makeFakeRole(ROLE_ID_2, 10)))

    const newRole = makeFakeRole('00000000-0000-0000-0000-000000000005', 90)
    jest.spyOn(loadRoleBySlugRepositoryStub, 'loadBySlug').mockReturnValueOnce(Promise.resolve(newRole))
    const updateSpy = jest.spyOn(updateLoginRoleRepositoryStub, 'updateRole')

    const result = await sut.perform({ actorId: ACTOR_ID, targetId: TARGET_ID, roleSlug: 'validQuery' })
    expect(result.isRight()).toBe(true)
    expect(updateSpy).toHaveBeenCalledWith(TARGET_ID, newRole.id.value)
  })
})
