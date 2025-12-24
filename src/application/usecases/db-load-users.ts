import { LoadUsers } from '@/domain/usecases/load-users'
import { UserModel } from '@/domain/models/user'
import { LoadUsersRepository } from '@/application/protocols/db/load-users-repository'

export class DbLoadUsers implements LoadUsers {
  constructor(private readonly loadUsersRepository: LoadUsersRepository) { }

  async load(): Promise<UserModel[]> {
    return await this.loadUsersRepository.loadAll()
  }
}
