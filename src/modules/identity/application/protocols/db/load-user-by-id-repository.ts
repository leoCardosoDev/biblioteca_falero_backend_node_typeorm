import { UserWithLogin } from '@/modules/identity/domain/usecases/load-users'

export interface LoadUserByIdRepository {
  loadById: (id: string) => Promise<UserWithLogin | null>
}
