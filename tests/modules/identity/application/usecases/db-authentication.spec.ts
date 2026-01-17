import { Authentication, AuthenticationParams } from '@/modules/identity/domain/usecases/authentication'
import { LoadRoleByIdRepository } from '@/modules/identity/application/protocols/db/load-role-by-id-repository'
import { HashComparer } from '@/modules/identity/application/protocols/cryptography/hash-comparer'
import { Hasher } from '@/modules/identity/application/protocols/cryptography/hasher'
import { Encrypter } from '@/modules/identity/application/protocols/cryptography/encrypter'
import { LoadAccountByEmailRepository } from '@/modules/identity/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/modules/identity/application/protocols/db/update-access-token-repository'
import { SaveSessionRepository } from '@/modules/identity/application/protocols/db/session-repository'
import { Login } from '@/modules/identity/domain/models/login'
import { TokenPayload, UserSessionModel } from '@/modules/identity/domain/models'
import { DbAuthentication } from '@/modules/identity/application/usecases/db-authentication'
import { Id } from '@/shared/domain/value-objects/id'
import { Role } from '@/modules/identity/domain/models/role'
import { Email } from '@/modules/identity/domain/value-objects/email'

type SutTypes = {
  sut: Authentication
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  loadRoleByIdRepositoryStub: LoadRoleByIdRepository
  hashComparerStub: HashComparer
  encrypterStub: Encrypter
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
  saveSessionRepositoryStub: SaveSessionRepository
  hasherStub: Hasher
}

const VALID_ID = '550e8400-e29b-41d4-a716-446655440000'
const USER_ID = '29962e38-d948-4a87-84a9-f4ca90d52a33'
const SESSION_ID = '63237524-27fb-4461-b2a5-f2609fcda713'
const VALID_ROLE_ID = '550e8400-e29b-41d4-a716-446655440099'

const makeFakeAccount = (): Login => Login.create({
  id: Id.create(VALID_ID),
  userId: Id.create(USER_ID),
  roleId: Id.create(VALID_ROLE_ID),
  email: Email.create('any_email@mail.com') as Email,
  passwordHash: 'hashed_password',
  isActive: true
})

const makeFakeAuthentication = (): AuthenticationParams => ({
  email: 'any_email@mail.com',
  password: 'any_password'
})

const makeFakeSession = (): UserSessionModel => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  return {
    id: Id.create(SESSION_ID),
    userId: Id.create(VALID_ID),
    refreshTokenHash: 'hashed_refresh_token',
    expiresAt,
    isValid: true,
    createdAt: new Date()
  }
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail(_email: string): Promise<Login | undefined> {
      return await Promise.resolve(makeFakeAccount())
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare(_plaintext: string, _digest: string): Promise<boolean> {
      return await Promise.resolve(true)
    }
  }
  return new HashComparerStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(_value: string): Promise<string> {
      return await Promise.resolve('hashed_refresh_token')
    }
  }
  return new HasherStub()
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(_payload: TokenPayload): Promise<string> {
      return await Promise.resolve('any_token')
    }
  }
  return new EncrypterStub()
}

const makeUpdateAccessTokenRepository = (): UpdateAccessTokenRepository => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    async updateAccessToken(_id: string, _token: string): Promise<void> {
      await Promise.resolve()
    }
  }
  return new UpdateAccessTokenRepositoryStub()
}

const makeSaveSessionRepository = (): SaveSessionRepository => {
  class SaveSessionRepositoryStub implements SaveSessionRepository {
    async save(_session: Omit<UserSessionModel, 'id' | 'createdAt'>): Promise<UserSessionModel> {
      return await Promise.resolve(makeFakeSession())
    }
  }
  return new SaveSessionRepositoryStub()
}

const makeLoadRoleByIdRepository = (): LoadRoleByIdRepository => {
  class LoadRoleByIdRepositoryStub implements LoadRoleByIdRepository {
    async loadById(id: Id): Promise<Role | null> {
      return Promise.resolve(Role.create({
        id: id,
        slug: 'ADMIN',
        description: 'Administrator'
      }))
    }
  }
  return new LoadRoleByIdRepositoryStub()
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const loadRoleByIdRepositoryStub = makeLoadRoleByIdRepository()
  const hashComparerStub = makeHashComparer()
  const encrypterStub = makeEncrypter()
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository()
  const saveSessionRepositoryStub = makeSaveSessionRepository()
  const hasherStub = makeHasher()
  const sut = new DbAuthentication(
    loadAccountByEmailRepositoryStub,
    loadRoleByIdRepositoryStub,
    hashComparerStub,
    encrypterStub,
    updateAccessTokenRepositoryStub,
    saveSessionRepositoryStub,
    hasherStub,
    7
  )
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    loadRoleByIdRepositoryStub,
    hashComparerStub,
    encrypterStub,
    updateAccessTokenRepositoryStub,
    saveSessionRepositoryStub,
    hasherStub
  }
}

describe('DbAuthentication UseCase', () => {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.auth(makeFakeAuthentication())
    expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeFakeAuthentication())
    await expect(promise).rejects.toThrow()
  })

  test('Should return undefined if LoadAccountByEmailRepository returns undefined', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce(undefined)
    const result = await sut.auth(makeFakeAuthentication())
    expect(result).toBeUndefined()
  })

  test('Should call HashComparer with correct values', async () => {
    const { sut, hashComparerStub } = makeSut()
    const compareSpy = jest.spyOn(hashComparerStub, 'compare')
    await sut.auth(makeFakeAuthentication())
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
  })

  test('Should throw if HashComparer throws', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeFakeAuthentication())
    await expect(promise).rejects.toThrow()
  })

  test('Should return undefined if HashComparer returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockResolvedValueOnce(false)
    const result = await sut.auth(makeFakeAuthentication())
    expect(result).toBeUndefined()
  })

  test('Should call Encrypter with correct payload', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.auth(makeFakeAuthentication())
    expect(encryptSpy).toHaveBeenCalledWith({ id: USER_ID, role: 'ADMIN' })
  })

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeFakeAuthentication())
    await expect(promise).rejects.toThrow()
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')
    await sut.auth(makeFakeAuthentication())
    expect(updateSpy).toHaveBeenCalledWith(VALID_ID, 'any_token')
  })

  test('Should throw if UpdateAccessTokenRepository throws', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeFakeAuthentication())
    await expect(promise).rejects.toThrow()
  })

  test('Should call Hasher with refresh token', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    await sut.auth(makeFakeAuthentication())
    expect(hashSpy).toHaveBeenCalled()
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeFakeAuthentication())
    await expect(promise).rejects.toThrow()
  })

  test('Should call SaveSessionRepository with correct values', async () => {
    const { sut, saveSessionRepositoryStub } = makeSut()
    const saveSpy = jest.spyOn(saveSessionRepositoryStub, 'save')
    await sut.auth(makeFakeAuthentication())
    expect(saveSpy).toHaveBeenCalled()
    const savedSession = saveSpy.mock.calls[0][0]
    expect(savedSession.userId.value).toBe(USER_ID)
    expect(savedSession.refreshTokenHash).toBe('hashed_refresh_token')
    expect(savedSession.isValid).toBe(true)
  })

  test('Should throw if SaveSessionRepository throws', async () => {
    const { sut, saveSessionRepositoryStub } = makeSut()
    jest.spyOn(saveSessionRepositoryStub, 'save').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeFakeAuthentication())
    await expect(promise).rejects.toThrow()
  })

  test('Should return authentication data with refreshToken on success', async () => {
    const { sut } = makeSut()
    const result = await sut.auth(makeFakeAuthentication())
    expect(result?.accessToken).toBe('any_token')
    expect(result?.refreshToken).toBeDefined()
    expect(result?.name).toBe('any_email@mail.com')
    expect(result?.role).toBe('ADMIN')
  })

  test('Should default role to STUDENT if account.roleId is missing (unlikely given mandatory, but if logic allows)', async () => {
    const { sut, loadRoleByIdRepositoryStub } = makeSut()
    // Mimic no role found
    jest.spyOn(loadRoleByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)
    const result = await sut.auth(makeFakeAuthentication())
    expect(result?.role).toBe('STUDENT')
  })

})
