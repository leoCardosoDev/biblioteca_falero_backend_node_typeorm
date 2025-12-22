import { AddAccount, AddAccountParams } from '@/domain/usecases'
import { AccountModel } from '@/domain/models/account'
import { Hasher, AddAccountRepository } from '@/application/protocols'

export class DbAddAccount implements AddAccount {
  constructor(
    private readonly hasher: Hasher,
    private readonly addAccountRepository: AddAccountRepository
  ) { }

  async add(accountData: AddAccountParams): Promise<AccountModel> {
    const hashedPassword = await this.hasher.hash(accountData.password as string)
    const account = await this.addAccountRepository.add(Object.assign({}, accountData, { password: hashedPassword }))
    return account
  }
}
