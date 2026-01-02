import { LoadUsers, UserWithLogin } from '@/domain/usecases/load-users'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'

export class DbLoadUsers implements LoadUsers {
  constructor(private readonly loadUsersRepository: LoadUsersRepository) { }

  async load(): Promise<UserWithLogin[]> {
    return await this.loadUsersRepository.loadAll()
  }
}
