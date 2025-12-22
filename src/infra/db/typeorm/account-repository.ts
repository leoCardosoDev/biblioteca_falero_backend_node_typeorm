import { AddAccountRepository } from '@/application/protocols/add-account-repository'
import { AddAccountParams } from '@/domain/usecases/add-account'
import { AccountModel } from '@/domain/models/account'
import { Account } from './entities/account'
import { TypeOrmHelper } from './typeorm-helper'

export class AccountRepository implements AddAccountRepository {
  async add(accountData: AddAccountParams): Promise<AccountModel> {
    const accountRepo = TypeOrmHelper.getRepository(Account)
    const account = accountRepo.create(accountData)
    await accountRepo.save(account)
    return account
  }
}
