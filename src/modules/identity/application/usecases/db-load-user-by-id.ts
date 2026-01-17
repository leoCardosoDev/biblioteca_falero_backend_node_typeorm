import { LoadUserById } from '@/modules/identity/domain/usecases/load-user-by-id'
import { UserWithLogin } from '@/modules/identity/domain/usecases/load-users'
import { LoadUserByIdRepository } from '@/modules/identity/application/protocols/db/load-user-by-id-repository'

export class DbLoadUserById implements LoadUserById {
  constructor(private readonly loadUserByIdRepository: LoadUserByIdRepository) { }

  async load(id: string): Promise<UserWithLogin | null> {
    return await this.loadUserByIdRepository.loadById(id)
  }
}
