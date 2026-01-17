
import { LoginModel } from '@/modules/identity/domain/models/login'

export interface LoadLoginByUserIdRepository {
  loadByUserId: (userId: string) => Promise<LoginModel | undefined>
}
