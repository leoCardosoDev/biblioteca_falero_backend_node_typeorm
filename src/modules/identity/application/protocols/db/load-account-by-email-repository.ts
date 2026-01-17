import { LoginModel } from '@/modules/identity/domain/entities/login'

export interface LoadAccountByEmailRepository {
  loadByEmail: (email: string) => Promise<LoginModel | undefined>
}
