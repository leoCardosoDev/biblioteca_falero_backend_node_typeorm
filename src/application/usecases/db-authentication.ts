import { Authentication, AuthenticationParams, AuthenticationModel } from '@/domain/usecases/authentication'
import { LoadAccountByEmailRepository } from '@/application/protocols/db/load-account-by-email-repository'
import { HashComparer } from '@/application/protocols/cryptography/hash-comparer'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import { UpdateAccessTokenRepository } from '@/application/protocols/db/update-access-token-repository'

export class DbAuthentication implements Authentication {
  constructor(
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository
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

    const accessToken = await this.encrypter.encrypt(account.id)
    await this.updateAccessTokenRepository.updateAccessToken(account.id, accessToken)

    return {
      accessToken,
      name: account.userId
    }
  }
}
