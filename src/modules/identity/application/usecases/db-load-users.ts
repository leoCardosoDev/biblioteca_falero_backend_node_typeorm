import { LoadUsers, UserWithLogin } from '@/modules/identity/application/usecases/load-users'
import { LoadUsersRepository } from '@/modules/identity/application/protocols/db/load-users-repository'

export class DbLoadUsers implements LoadUsers {
  constructor(private readonly loadUsersRepository: LoadUsersRepository) { }

  async load(): Promise<UserWithLogin[]> {
    return await this.loadUsersRepository.loadAll()
  }
}
