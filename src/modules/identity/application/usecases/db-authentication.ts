import { Authentication, AuthenticationParams, AuthenticationModel } from '@/modules/identity/domain/usecases/authentication'
import { LoadRoleByIdRepository } from '@/modules/identity/application/protocols/db/load-role-by-id-repository'
import { ExpirationDate } from '@/modules/identity/domain/value-objects/expiration-date'
import { LoadAccountByEmailRepository } from '@/modules/identity/application/protocols/db/load-account-by-email-repository'
import { HashComparer } from '@/shared/application/protocols/cryptography/hash-comparer'
import { Encrypter } from '@/shared/application/protocols/cryptography/encrypter'
import { UpdateAccessTokenRepository } from '@/modules/identity/application/protocols/db/update-access-token-repository'
import { SaveSessionRepository } from '@/modules/identity/application/protocols/db/session-repository'
import { Hasher } from '@/shared/application/protocols/cryptography/hasher'
import crypto from 'crypto'

export class DbAuthentication implements Authentication {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly loadRoleByIdRepository: LoadRoleByIdRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository,
    private readonly saveSessionRepository: SaveSessionRepository,
    private readonly hasher: Hasher,
    private readonly refreshTokenExpirationDays: number
  ) { }

  async auth(params: AuthenticationParams): Promise<AuthenticationModel | undefined> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(params.email)
    if (!account) {
      return undefined
    }

    const isValid = await this.hashComparer.compare(params.password, account.passwordHash)
    if (!isValid) {
      return undefined
    }

    let role = 'STUDENT'
    const roleEntity = await this.loadRoleByIdRepository.loadById(account.roleId)
    if (roleEntity) {
      role = roleEntity.slug
    }

    const accessToken = await this.encrypter.encrypt({ id: account.userId.value, role: role.toUpperCase() })
    await this.updateAccessTokenRepository.updateAccessToken(account.id.value, accessToken)

    const refreshToken = crypto.randomBytes(32).toString('hex')
    const refreshTokenHash = await this.hasher.hash(refreshToken)
    const expiresAt = ExpirationDate.fromDays(this.refreshTokenExpirationDays).toDate()

    await this.saveSessionRepository.save({
      userId: account.userId,
      refreshTokenHash,
      expiresAt,
      isValid: true
    })

    return {
      accessToken,
      refreshToken,
      name: account.email.value,
      role
    }
  }
}
