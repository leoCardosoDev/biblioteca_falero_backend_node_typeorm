import { Authentication, AuthenticationParams, AuthenticationModel } from '@/domain/usecases/authentication'
import { Role } from '@/domain/models'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { HashComparer } from '@/application/protocols/cryptography/hash-comparer'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'
import { SaveSessionRepository } from '@/application/protocols/db/session-repository'
import { Hasher } from '@/application/protocols/cryptography/hasher'
import crypto from 'crypto'

export class DbAuthentication implements Authentication {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository,
    private readonly saveSessionRepository: SaveSessionRepository,
    private readonly hasher: Hasher,
    private readonly refreshTokenExpirationDays: number = 7
  ) { }

  async auth(params: AuthenticationParams): Promise<AuthenticationModel | undefined> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(params.email)
    if (!account) {
      return undefined
    }

    const isValid = await this.hashComparer.compare(params.password, account.password)
    if (!isValid) {
      return undefined
    }

    const role = (account.role as Role) ?? Role.MEMBER
    const accessToken = await this.encrypter.encrypt({ id: account.id, role })
    await this.updateAccessTokenRepository.updateAccessToken(account.id, accessToken)

    // Generate refresh token
    const refreshToken = crypto.randomBytes(32).toString('hex')
    const refreshTokenHash = await this.hasher.hash(refreshToken)

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpirationDays)

    // Save session
    await this.saveSessionRepository.save({
      userId: account.userId,
      refreshTokenHash,
      expiresAt,
      isValid: true
    })

    return {
      accessToken,
      refreshToken,
      name: account.name ?? account.userId,
      role
    }
  }
}
