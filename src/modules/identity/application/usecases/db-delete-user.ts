import { DeleteUser } from '@/modules/identity/domain/usecases/delete-user'
import { DeleteUserRepository } from '@/modules/identity/application/protocols/db/delete-user-repository'

export class DbDeleteUser implements DeleteUser {
  constructor(private readonly deleteUserRepository: DeleteUserRepository) { }

  async delete(id: string): Promise<void> {
    return await this.deleteUserRepository.delete(id)
  }
}
