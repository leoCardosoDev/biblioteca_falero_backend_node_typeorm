import { UserModel } from '@/domain/models/user'

export interface UserDTO {
  id: string
  name: string
  email: string
  rg: string
  cpf: string
  gender: string
  phone?: string
  status: string
  version: number
  address?: {
    street: string
    number: string
    complement?: string
    neighborhoodId: string
    cityId: string
    stateId: string
    zipCode: string
  }
  login?: {
    role: string
    status: string
  }
}

export class UserMapper {
  static toDTO(user: UserModel): UserDTO {
    return {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      rg: user.rg.value,
      cpf: user.cpf.value,
      gender: user.gender,
      phone: user.phone,
      status: user.status.value,
      version: user.version,
      address: user.address ? {
        street: user.address.street,
        number: user.address.number,
        complement: user.address.complement,
        neighborhoodId: user.address.neighborhoodId.value,
        cityId: user.address.cityId.value,
        stateId: user.address.stateId.value,
        zipCode: user.address.zipCode
      } : undefined,
      login: user.login ? {
        role: user.login.role.value,
        status: user.login.status.value
      } : undefined
    }
  }
}
