import { UserWithLogin } from '@/domain/usecases/load-users'

export interface LoadUserByIdRepository {
  loadById: (id: string) => Promise<UserWithLogin | null>
}
