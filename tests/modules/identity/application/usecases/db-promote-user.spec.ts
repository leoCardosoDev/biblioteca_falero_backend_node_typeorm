
import { DbPromoteUser } from '@/modules/identity/application/usecases/db-promote-user'
import { LoadLoginByUserIdRepository } from '@/modules/identity/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/modules/identity/application/protocols/db/load-role-by-id-repository'
import { UpdateLoginRoleRepository } from '@/modules/identity/application/protocols/db/update-login-role-repository'
import { LoginModel } from '@/modules/identity/domain/models/login'
import { Role } from '@/modules/identity/domain/models/role'
import { Id } from '@/shared/domain/value-objects/id'
import { AccessDeniedError } from '@/shared/domain/errors/access-denied-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

const VALID_UUID = '00000000-0000-0000-0000-000000000001'
const ANOTHER_UUID = '00000000-0000-0000-0000-000000000002'
const ROLE_UUID = '00000000-0000-0000-0000-000000000003'
const NEW_ROLE_UUID = '00000000-0000-0000-0000-000000000004'

const makeLoadLoginByUserIdRepository = (): LoadLoginByUserIdRepository => {
  class LoadLoginByUserIdRepositoryStub implements LoadLoginByUserIdRepository {
    async loadByUserId(userId: string): Promise<LoginModel | undefined> {
      return Promise.resolve({
        id: Id.create(VALID_UUID),
        userId: Id.create(userId),
        roleId: Id.create(ROLE_UUID),
        password: 'any_password',
        status: 'ACTIVE'
      } as unknown as LoginModel)
    }
  }
  return new LoadLoginByUserIdRepositoryStub()
}

const makeLoadRoleByIdRepository = (): LoadRoleByIdRepository => {
  class LoadRoleByIdRepositoryStub implements LoadRoleByIdRepository {
    async loadById(id: Id): Promise<Role | null> {
      return Promise.resolve({
        id: id,
        slug: 'any_slug',
        description: 'any_description',
        powerLevel: 50,
        permissions: []
      } as unknown as Role)
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

interface SutTypes {
  sut: DbPromoteUser
  loadLoginByUserIdRepositoryStub: LoadLoginByUserIdRepository
  loadRoleByIdRepositoryStub: LoadRoleByIdRepository
  updateLoginRoleRepositoryStub: UpdateLoginRoleRepository
}

const makeSut = (): SutTypes => {
  const loadLoginByUserIdRepositoryStub = makeLoadLoginByUserIdRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const updateLoginRoleRepositoryStub = makeUpdateLoginRoleRepository()
  const sut = new DbPromoteUser(loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, updateLoginRoleRepositoryStub)
  return {
    sut,
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateLoginRoleRepositoryStub
  }
}

describe('DbPromoteUser UseCase', () => {
  test('Should call LoadLoginByUserId with correct actorId', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
    await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(loadSpy).toHaveBeenCalledWith(VALID_UUID)
  })

  test('Should return AccessDeniedError if actorLogin is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockReturnValueOnce(Promise.resolve(undefined))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should call LoadLoginByUserId with correct targetId', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
    await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(loadSpy).toHaveBeenCalledWith(ANOTHER_UUID)
  })

  test('Should return NotFoundError if targetLogin is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(VALID_UUID), userId: Id.create(VALID_UUID), roleId: Id.create(ROLE_UUID), password: 'pwd' } as unknown as LoginModel))
      .mockReturnValueOnce(Promise.resolve(undefined))

    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new NotFoundError('Login'))
  })

  test('Should return AccessDeniedError if actorRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return AccessDeniedError if targetRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve(null))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return NotFoundError if newRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 100 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve(null))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new NotFoundError('Role'))
  })

  test('Should return AccessDeniedError if actorRole powerLevel is less than or equal to targetRole', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return AccessDeniedError if actorRole powerLevel is less than or equal to newRole', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 0 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should call UpdateLoginRole with correct values', async () => {
    const { sut, updateLoginRoleRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 100 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 20 } as unknown as Role))
    const updateSpy = jest.spyOn(updateLoginRoleRepositoryStub, 'updateRole')
    await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(updateSpy).toHaveBeenCalledWith(ANOTHER_UUID, NEW_ROLE_UUID)
  })

  test('Should return right on success', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 100 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as unknown as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 20 } as unknown as Role))
    const result = await sut.promote(VALID_UUID, ANOTHER_UUID, NEW_ROLE_UUID)
    expect(result.isRight()).toBe(true)
  })
})
