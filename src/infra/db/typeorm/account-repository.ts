import { AddAccountRepository } from '@/application/protocols/add-account-repository'
import { AddAccountParams } from '@/domain/usecases/add-account'
import { AccountModel } from '@/domain/models/account'
import { AccountTypeOrmEntity } from './entities/account-entity'
import { TypeOrmHelper } from './typeorm-helper'

export class AccountRepository implements AddAccountRepository {
  async add(accountData: AddAccountParams): Promise<AccountModel> {
    const accountRepo = TypeOrmHelper.getRepository(AccountTypeOrmEntity)
    const accountEntity = accountRepo.create(accountData)
    await accountRepo.save(accountEntity)
    return {
      id: accountEntity.id,
      name: accountEntity.name,
      email: accountEntity.email,
      password: accountEntity.password
    }
  }
}
