import { LoginModel } from '@/domain/models/login'

export interface LoadAccountByEmailRepository {
  loadByEmail: (email: string) => Promise<LoginModel | undefined>
}
