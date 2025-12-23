import { UserModel } from '@/domain/models/user'

export interface LoadUserByCpfRepository {
  loadByCpf: (cpf: string) => Promise<UserModel | undefined>
}
