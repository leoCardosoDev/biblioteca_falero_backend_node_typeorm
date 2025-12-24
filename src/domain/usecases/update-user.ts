import { UserModel } from '@/domain/models/user'

export type UpdateUserParams = {
  id: string
  name?: string
  email?: string
  rg?: string
  cpf?: string
  dataNascimento?: string
}

export interface UpdateUser {
  update: (userData: UpdateUserParams) => Promise<UserModel>
}
