import { UserModel } from '@/modules/identity/domain/entities/user'

export interface LoadUserByCpfRepository {
  loadByCpf: (cpf: string) => Promise<UserModel | undefined>
}
