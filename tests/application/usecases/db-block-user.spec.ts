
import { DbBlockUser } from '@/application/usecases/db-block-user'
import { LoadLoginByUserIdRepository } from '@/application/protocols/db/load-login-by-user-id-repository'
import { LoadRoleByIdRepository } from '@/application/protocols/db/load-role-by-id-repository'
import { UpdateUserStatusRepository } from '@/application/protocols/db/update-user-status-repository'
import { UserStatus } from '@/domain/value-objects/user-status'
import { LoginModel } from '@/domain/models/login'
import { Role } from '@/domain/models/role'
import { Id } from '@/domain/value-objects/id'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { NotFoundError } from '@/domain/errors/not-found-error'

const VALID_UUID = '00000000-0000-0000-0000-000000000001'
const ANOTHER_UUID = '00000000-0000-0000-0000-000000000002'
const ROLE_UUID = '00000000-0000-0000-0000-000000000003'

const makeLoadLoginByUserIdRepository = (): LoadLoginByUserIdRepository => {
  class LoadLoginByUserIdRepositoryStub implements LoadLoginByUserIdRepository {
    async loadByUserId(userId: string): Promise<LoginModel | null> {
      return Promise.resolve({
        id: Id.create(VALID_UUID),
        userId: Id.create(userId),
        roleId: Id.create(ROLE_UUID),
        password: 'any_password',
        status: 'ACTIVE'
      } as LoginModel)
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
      } as Role)
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

interface SutTypes {
  sut: DbBlockUser
  loadLoginByUserIdRepositoryStub: LoadLoginByUserIdRepository
  loadRoleByIdRepositoryStub: LoadRoleByIdRepository
  updateUserStatusRepositoryStub: UpdateUserStatusRepository
}

const makeSut = (): SutTypes => {
  const loadLoginByUserIdRepositoryStub = makeLoadLoginByUserIdRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const updateUserStatusRepositoryStub = makeUpdateUserStatusRepository()
  const sut = new DbBlockUser(loadLoginByUserIdRepositoryStub, loadRoleByIdRepositoryStub, updateUserStatusRepositoryStub)
  return {
    sut,
    loadLoginByUserIdRepositoryStub,
    loadRoleByIdRepositoryStub,
    updateUserStatusRepositoryStub
  }
}

describe('DbBlockUser UseCase', () => {
  test('Should call LoadLoginByUserId with correct actorId', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
    await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(loadSpy).toHaveBeenCalledWith(VALID_UUID)
  })

  test('Should return AccessDeniedError if actorLogin is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId').mockReturnValueOnce(Promise.resolve(null))
    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should call LoadLoginByUserId with correct targetId', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
    await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(loadSpy).toHaveBeenCalledWith(ANOTHER_UUID)
  })

  test('Should return NotFoundError if targetLogin is not found', async () => {
    const { sut, loadLoginByUserIdRepositoryStub } = makeSut()
    jest.spyOn(loadLoginByUserIdRepositoryStub, 'loadByUserId')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(VALID_UUID), userId: Id.create(VALID_UUID), roleId: Id.create(ROLE_UUID), password: 'pwd' } as LoginModel))
      .mockReturnValueOnce(Promise.resolve(null))

    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new NotFoundError('Login'))
  })

  test('Should return AccessDeniedError if actorRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))
    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return AccessDeniedError if targetRole is not found', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as Role))
      .mockReturnValueOnce(Promise.resolve(null))
    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should return AccessDeniedError if actorRole powerLevel is less than or equal to targetRole', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as Role))
    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new AccessDeniedError())
  })

  test('Should call UpdateUserStatus with correct values', async () => {
    const { sut, updateUserStatusRepositoryStub, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 100 } as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as Role))
    const updateSpy = jest.spyOn(updateUserStatusRepositoryStub, 'updateStatus')
    await sut.block(VALID_UUID, ANOTHER_UUID)
    const status = UserStatus.create('BLOCKED') as UserStatus
    expect(updateSpy).toHaveBeenCalledWith(ANOTHER_UUID, status)
  })

  test('Should return right on success', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 100 } as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as Role))
    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isRight()).toBe(true)
  })

  test('Should return AccessDeniedError if UserStatus.create returns Error', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 100 } as Role))
      .mockReturnValueOnce(Promise.resolve({ id: Id.create(ROLE_UUID), powerLevel: 10 } as Role))
    jest.spyOn(UserStatus, 'create').mockReturnValueOnce(new Error('UserStatus Error'))
    const result = await sut.block(VALID_UUID, ANOTHER_UUID)
    expect(result.isLeft()).toBe(true)
    expect(result.value).toEqual(new Error('UserStatus Error'))
  })
})
