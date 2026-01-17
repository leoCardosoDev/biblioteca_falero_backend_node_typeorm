import { LoginModel } from '@/modules/identity/domain/models/login'

export type LoginDTO = {
  id: string
  userId: string
  roleId: string
  email: string
  status: string
}

export class LoginViewModel {
  static toHTTP(login: LoginModel): LoginDTO {
    return {
      id: login.id.value,
      userId: login.userId.value,
      roleId: login.roleId.value,
      email: login.email.value,
      status: login.isActive ? 'ACTIVE' : 'INACTIVE'
    }
  }
}
