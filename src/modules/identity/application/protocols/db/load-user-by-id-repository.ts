import { UserWithLogin } from '@/modules/identity/application/usecases/load-users'

export interface LoadUserByIdRepository {
  loadById: (id: string) => Promise<UserWithLogin | null>
}
