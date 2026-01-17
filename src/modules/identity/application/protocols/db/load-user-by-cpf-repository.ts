import { UserModel } from '@/modules/identity/domain/models/user'

export interface LoadUserByCpfRepository {
  loadByCpf: (cpf: string) => Promise<UserModel | undefined>
}
