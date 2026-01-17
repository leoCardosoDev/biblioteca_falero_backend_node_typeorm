
import { LoginModel } from '@/modules/identity/domain/entities/login'

export interface LoadLoginByUserIdRepository {
  loadByUserId: (userId: string) => Promise<LoginModel | undefined>
}
