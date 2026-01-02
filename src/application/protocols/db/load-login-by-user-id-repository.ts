
import { LoginModel } from '@/domain/models/login'

export interface LoadLoginByUserIdRepository {
  loadByUserId: (userId: string) => Promise<LoginModel | undefined>
}
