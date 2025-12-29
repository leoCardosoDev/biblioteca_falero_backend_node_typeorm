import { Authentication, AuthenticationParams } from '@/domain/usecases/authentication'
import { HashComparer } from '@/application/protocols/cryptography/hash-comparer'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'
import { SaveSessionRepository } from '@/application/protocols/db/session-repository'
import { LoginModel } from '@/domain/models/login'
import { TokenPayload, Role, UserSessionModel } from '@/domain/models'
import { DbAuthentication } from '@/application/usecases/db-authentication'
import { LoginId, UserId, SessionId } from '@/domain/models/ids'

type SutTypes = {
  sut: Authentication
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashComparerStub: HashComparer
  encrypterStub: Encrypter
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
  saveSessionRepositoryStub: SaveSessionRepository
  hasherStub: Hasher
}

const makeFakeAccount = (): LoginModel => ({
  id: 'any_id' as LoginId,
  userId: 'any_user_id' as UserId,
  password: 'hashed_password',
  role: 'ADMIN',
  name: 'any_name'
})

const makeFakeAuthentication = (): AuthenticationParams => ({
  email: 'any_email@mail.com',
  password: 'any_password'
})

const makeFakeSession = (): UserSessionModel => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  return {
    id: 'any_session_id' as SessionId,
    userId: 'any_id' as UserId,
    refreshTokenHash: 'hashed_refresh_token',
    expiresAt,
    isValid: true,
    createdAt: new Date()
  }
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail(_email: string): Promise<LoginModel | undefined> {
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

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const hashComparerStub = makeHashComparer()
  const encrypterStub = makeEncrypter()
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository()
  const saveSessionRepositoryStub = makeSaveSessionRepository()
  const hasherStub = makeHasher()
  const sut = new DbAuthentication(
    loadAccountByEmailRepositoryStub,
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
    expect(encryptSpy).toHaveBeenCalledWith({ id: 'any_id', role: Role.ADMIN })
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
    expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token')
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
    expect(savedSession.userId).toBe('any_user_id')
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
    expect(result?.name).toBe('any_name')
    expect(result?.role).toBe(Role.ADMIN)
  })

  test('Should default role to MEMBER if account.role is undefined', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce({
      id: 'any_id' as LoginId,
      userId: 'any_user_id' as UserId,
      password: 'hashed_password',
      role: undefined as unknown as string,
      name: 'any_name'
    })
    const result = await sut.auth(makeFakeAuthentication())
    expect(result?.role).toBe(Role.MEMBER)
  })

  test('Should use userId as name if account.name is undefined', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce({
      id: 'any_id' as LoginId,
      userId: 'any_user_id' as UserId,
      password: 'hashed_password',
      role: 'ADMIN',
      name: undefined as unknown as string
    })
    const result = await sut.auth(makeFakeAuthentication())
    expect(result?.name).toBe('any_user_id')
  })

  test('Should default role to MEMBER if account.role is null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce({
      id: 'any_id' as LoginId,
      userId: 'any_user_id' as UserId,
      password: 'hashed_password',
      role: null as unknown as string,
      name: 'any_name'
    })
    const result = await sut.auth(makeFakeAuthentication())
    expect(result?.role).toBe(Role.MEMBER)
  })

  test('Should use userId as name if account.name is null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce({
      id: 'any_id' as LoginId,
      userId: 'any_user_id' as UserId,
      password: 'hashed_password',
      role: 'ADMIN',
      name: null as unknown as string
    })
    const result = await sut.auth(makeFakeAuthentication())
    expect(result?.name).toBe('any_user_id')
  })
})
