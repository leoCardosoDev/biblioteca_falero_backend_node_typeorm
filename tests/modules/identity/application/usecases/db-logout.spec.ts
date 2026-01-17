import { DbLogout } from '@/modules/identity/application/usecases/db-logout'
import { Logout } from '@/modules/identity/application/usecases/logout'
import { Hasher } from '@/shared/application/protocols/cryptography/hasher'
import { LoadSessionByTokenRepository, InvalidateSessionRepository } from '@/modules/identity/application/protocols/db/session-repository'
import { UserSessionModel } from '@/modules/identity/domain/models'
import { Id } from '@/shared/domain/value-objects/id'

const mockSession = (): UserSessionModel => ({
  id: Id.restore('any_session_id') as Id,
  userId: Id.restore('any_user_id') as Id,
  refreshTokenHash: 'any_hash',
  expiresAt: new Date(),
  ipAddress: 'any_ip',
  userAgent: 'any_ua',
  isValid: true,
  createdAt: new Date()
})

class HasherSpy implements Hasher {
  plaintext: string
  result = 'hashed_token'
  async hash(plaintext: string): Promise<string> {
    this.plaintext = plaintext
    return this.result
  }
}

class LoadSessionByTokenRepositorySpy implements LoadSessionByTokenRepository {
  tokenHash: string
  result: UserSessionModel | null = mockSession()
  async loadByToken(tokenHash: string): Promise<UserSessionModel | null> {
    this.tokenHash = tokenHash
    return this.result
  }
}

class InvalidateSessionRepositorySpy implements InvalidateSessionRepository {
  sessionId: string
  async invalidate(sessionId: string): Promise<void> {
    this.sessionId = sessionId
  }
}

type SutTypes = {
  sut: Logout
  hasherSpy: HasherSpy
  loadSessionByTokenRepositorySpy: LoadSessionByTokenRepositorySpy
  invalidateSessionRepositorySpy: InvalidateSessionRepositorySpy
}

const makeSut = (): SutTypes => {
  const hasherSpy = new HasherSpy()
  const loadSessionByTokenRepositorySpy = new LoadSessionByTokenRepositorySpy()
  const invalidateSessionRepositorySpy = new InvalidateSessionRepositorySpy()
  const sut = new DbLogout(hasherSpy, loadSessionByTokenRepositorySpy, invalidateSessionRepositorySpy)
  return {
    sut,
    hasherSpy,
    loadSessionByTokenRepositorySpy,
    invalidateSessionRepositorySpy
  }
}

describe('DbLogout UseCase', () => {
  test('Should call Hasher with correct value', async () => {
    const { sut, hasherSpy } = makeSut()
    await sut.logout('any_token')
    expect(hasherSpy.plaintext).toBe('any_token')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherSpy } = makeSut()
    jest.spyOn(hasherSpy, 'hash').mockRejectedValueOnce(new Error())
    const promise = sut.logout('any_token')
    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadSessionByTokenRepository with correct value', async () => {
    const { sut, loadSessionByTokenRepositorySpy } = makeSut()
    await sut.logout('any_token')
    expect(loadSessionByTokenRepositorySpy.tokenHash).toBe('hashed_token')
  })

  test('Should throw if LoadSessionByTokenRepository throws', async () => {
    const { sut, loadSessionByTokenRepositorySpy } = makeSut()
    jest.spyOn(loadSessionByTokenRepositorySpy, 'loadByToken').mockRejectedValueOnce(new Error())
    const promise = sut.logout('any_token')
    await expect(promise).rejects.toThrow()
  })

  test('Should call InvalidateSessionRepository with correct value', async () => {
    const { sut, invalidateSessionRepositorySpy } = makeSut()
    await sut.logout('any_token')
    expect(invalidateSessionRepositorySpy.sessionId).toBe('any_session_id')
  })

  test('Should not call InvalidateSessionRepository if session is null', async () => {
    const { sut, loadSessionByTokenRepositorySpy, invalidateSessionRepositorySpy } = makeSut()
    loadSessionByTokenRepositorySpy.result = null
    const invalidateSpy = jest.spyOn(invalidateSessionRepositorySpy, 'invalidate')
    await sut.logout('any_token')
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  test('Should throw if InvalidateSessionRepository throws', async () => {
    const { sut, invalidateSessionRepositorySpy } = makeSut()
    jest.spyOn(invalidateSessionRepositorySpy, 'invalidate').mockRejectedValueOnce(new Error())
    const promise = sut.logout('any_token')
    await expect(promise).rejects.toThrow()
  })
})
