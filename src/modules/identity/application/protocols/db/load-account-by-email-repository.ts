import { LoginModel } from '@/modules/identity/domain/models/login'

export interface LoadAccountByEmailRepository {
  loadByEmail: (email: string) => Promise<LoginModel | undefined>
}
