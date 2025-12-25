import { RefreshToken, RefreshTokenParams } from '@/domain/usecases/refresh-token'
import { UserSessionModel, TokenPayload, Role } from '@/domain/models'
import {
  LoadSessionByTokenRepository,
  InvalidateSessionRepository,
  SaveSessionRepository,
  LoadUserBySessionRepository
} from '@/application/protocols/db/session-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import { DbRefreshToken } from '@/application/usecases/db-refresh-token'

type SutTypes = {
  sut: RefreshToken
  loadSessionByTokenRepositoryStub: LoadSessionByTokenRepository
  loadUserBySessionRepositoryStub: LoadUserBySessionRepository
  invalidateSessionRepositoryStub: InvalidateSessionRepository
  saveSessionRepositoryStub: SaveSessionRepository
  hasherStub: Hasher
  encrypterStub: Encrypter
}

const makeFakeSession = (): UserSessionModel => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  return {
    id: 'any_session_id',
    userId: 'any_user_id',
    refreshTokenHash: 'hashed_token',
    expiresAt,
    ipAddress: '127.0.0.1',
    userAgent: 'any_user_agent',
    isValid: true,
    createdAt: new Date()
  }
}

const makeFakeUser = (): { id: string; name: string; role: string } => ({
  id: 'any_user_id',
  name: 'any_name',
  role: 'ADMIN'
})

const makeFakeRefreshTokenParams = (): RefreshTokenParams => ({
  refreshToken: 'any_refresh_token',
  ipAddress: '127.0.0.1',
  userAgent: 'any_user_agent'
})

const makeLoadSessionByTokenRepository = (): LoadSessionByTokenRepository => {
  class LoadSessionByTokenRepositoryStub implements LoadSessionByTokenRepository {
    async loadByToken(_tokenHash: string): Promise<UserSessionModel | null> {
      return await Promise.resolve(makeFakeSession())
    }
  }
  return new LoadSessionByTokenRepositoryStub()
}

const makeLoadUserBySessionRepository = (): LoadUserBySessionRepository => {
  class LoadUserBySessionRepositoryStub implements LoadUserBySessionRepository {
    async loadUserBySessionId(_sessionId: string): Promise<{ id: string; name: string; role: string } | null> {
      return await Promise.resolve(makeFakeUser())
    }
  }
  return new LoadUserBySessionRepositoryStub()
}

const makeInvalidateSessionRepository = (): InvalidateSessionRepository => {
  class InvalidateSessionRepositoryStub implements InvalidateSessionRepository {
    async invalidate(_sessionId: string): Promise<void> {
      await Promise.resolve()
    }
  }
  return new InvalidateSessionRepositoryStub()
}

const makeSaveSessionRepository = (): SaveSessionRepository => {
  class SaveSessionRepositoryStub implements SaveSessionRepository {
    async save(_session: Omit<UserSessionModel, 'id' | 'createdAt'>): Promise<UserSessionModel> {
      return await Promise.resolve(makeFakeSession())
    }
  }
  return new SaveSessionRepositoryStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash(_value: string): Promise<string> {
      return await Promise.resolve('hashed_token')
    }
  }
  return new HasherStub()
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(_payload: TokenPayload): Promise<string> {
      return await Promise.resolve('any_access_token')
    }
  }
  return new EncrypterStub()
}

const makeSut = (): SutTypes => {
  const loadSessionByTokenRepositoryStub = makeLoadSessionByTokenRepository()
  const loadUserBySessionRepositoryStub = makeLoadUserBySessionRepository()
  const invalidateSessionRepositoryStub = makeInvalidateSessionRepository()
  const saveSessionRepositoryStub = makeSaveSessionRepository()
  const hasherStub = makeHasher()
  const encrypterStub = makeEncrypter()
  const sut = new DbRefreshToken(
    loadSessionByTokenRepositoryStub,
    loadUserBySessionRepositoryStub,
    invalidateSessionRepositoryStub,
    saveSessionRepositoryStub,
    hasherStub,
    encrypterStub,
    7
  )
  return {
    sut,
    loadSessionByTokenRepositoryStub,
    loadUserBySessionRepositoryStub,
    invalidateSessionRepositoryStub,
    saveSessionRepositoryStub,
    hasherStub,
    encrypterStub
  }
}

describe('DbRefreshToken UseCase', () => {
  test('Should call Hasher with correct refresh token', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(hashSpy).toHaveBeenCalledWith('any_refresh_token')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockRejectedValueOnce(new Error())
    const promise = sut.refresh(makeFakeRefreshTokenParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadSessionByTokenRepository with correct token hash', async () => {
    const { sut, loadSessionByTokenRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadSessionByTokenRepositoryStub, 'loadByToken')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(loadSpy).toHaveBeenCalledWith('hashed_token')
  })

  test('Should throw if LoadSessionByTokenRepository throws', async () => {
    const { sut, loadSessionByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadSessionByTokenRepositoryStub, 'loadByToken').mockRejectedValueOnce(new Error())
    const promise = sut.refresh(makeFakeRefreshTokenParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadSessionByTokenRepository returns null', async () => {
    const { sut, loadSessionByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadSessionByTokenRepositoryStub, 'loadByToken').mockResolvedValueOnce(null)
    const result = await sut.refresh(makeFakeRefreshTokenParams())
    expect(result).toBeNull()
  })

  test('Should return null if session is not valid', async () => {
    const { sut, loadSessionByTokenRepositoryStub } = makeSut()
    const invalidSession = makeFakeSession()
    invalidSession.isValid = false
    jest.spyOn(loadSessionByTokenRepositoryStub, 'loadByToken').mockResolvedValueOnce(invalidSession)
    const result = await sut.refresh(makeFakeRefreshTokenParams())
    expect(result).toBeNull()
  })

  test('Should return null if session is expired', async () => {
    const { sut, loadSessionByTokenRepositoryStub } = makeSut()
    const expiredSession = makeFakeSession()
    expiredSession.expiresAt = new Date('2020-01-01')
    jest.spyOn(loadSessionByTokenRepositoryStub, 'loadByToken').mockResolvedValueOnce(expiredSession)
    const result = await sut.refresh(makeFakeRefreshTokenParams())
    expect(result).toBeNull()
  })

  test('Should call LoadUserBySessionRepository with correct session id', async () => {
    const { sut, loadUserBySessionRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadUserBySessionRepositoryStub, 'loadUserBySessionId')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(loadSpy).toHaveBeenCalledWith('any_session_id')
  })

  test('Should throw if LoadUserBySessionRepository throws', async () => {
    const { sut, loadUserBySessionRepositoryStub } = makeSut()
    jest.spyOn(loadUserBySessionRepositoryStub, 'loadUserBySessionId').mockRejectedValueOnce(new Error())
    const promise = sut.refresh(makeFakeRefreshTokenParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadUserBySessionRepository returns null', async () => {
    const { sut, loadUserBySessionRepositoryStub } = makeSut()
    jest.spyOn(loadUserBySessionRepositoryStub, 'loadUserBySessionId').mockResolvedValueOnce(null)
    const result = await sut.refresh(makeFakeRefreshTokenParams())
    expect(result).toBeNull()
  })

  test('Should call InvalidateSessionRepository with correct session id', async () => {
    const { sut, invalidateSessionRepositoryStub } = makeSut()
    const invalidateSpy = jest.spyOn(invalidateSessionRepositoryStub, 'invalidate')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(invalidateSpy).toHaveBeenCalledWith('any_session_id')
  })

  test('Should throw if InvalidateSessionRepository throws', async () => {
    const { sut, invalidateSessionRepositoryStub } = makeSut()
    jest.spyOn(invalidateSessionRepositoryStub, 'invalidate').mockRejectedValueOnce(new Error())
    const promise = sut.refresh(makeFakeRefreshTokenParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should call SaveSessionRepository with correct values', async () => {
    const { sut, saveSessionRepositoryStub } = makeSut()
    const saveSpy = jest.spyOn(saveSessionRepositoryStub, 'save')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(saveSpy).toHaveBeenCalled()
    const savedSession = saveSpy.mock.calls[0][0]
    expect(savedSession.userId).toBe('any_user_id')
    expect(savedSession.isValid).toBe(true)
    expect(savedSession.ipAddress).toBe('127.0.0.1')
    expect(savedSession.userAgent).toBe('any_user_agent')
  })

  test('Should throw if SaveSessionRepository throws', async () => {
    const { sut, saveSessionRepositoryStub } = makeSut()
    jest.spyOn(saveSessionRepositoryStub, 'save').mockRejectedValueOnce(new Error())
    const promise = sut.refresh(makeFakeRefreshTokenParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should call Encrypter with correct payload', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(encryptSpy).toHaveBeenCalledWith({ id: 'any_user_id', role: Role.ADMIN })
  })

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockRejectedValueOnce(new Error())
    const promise = sut.refresh(makeFakeRefreshTokenParams())
    await expect(promise).rejects.toThrow()
  })

  test('Should return new tokens on success', async () => {
    const { sut } = makeSut()
    const result = await sut.refresh(makeFakeRefreshTokenParams())
    expect(result).not.toBeNull()
    expect(result?.accessToken).toBe('any_access_token')
    expect(result?.refreshToken).toBeDefined()
    expect(result?.refreshToken).not.toBe('any_refresh_token')
    expect(result?.name).toBe('any_name')
    expect(result?.role).toBe('ADMIN')
  })

  test('Should default role to MEMBER if user.role is undefined', async () => {
    const { sut, loadUserBySessionRepositoryStub, encrypterStub } = makeSut()
    jest.spyOn(loadUserBySessionRepositoryStub, 'loadUserBySessionId').mockResolvedValueOnce({
      id: 'any_user_id',
      name: 'any_name',
      role: undefined as unknown as string
    })
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.refresh(makeFakeRefreshTokenParams())
    expect(encryptSpy).toHaveBeenCalledWith({ id: 'any_user_id', role: Role.MEMBER })
  })
})
