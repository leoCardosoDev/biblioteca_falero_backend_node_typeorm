import { User } from '@/modules/identity/domain/entities/user'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { UserLogin } from '@/modules/identity/domain/value-objects/user-login'

export type AddressDTO = {
  street: string
  number: string
  complement?: string
  neighborhoodId: string
  neighborhood: string
  cityId: string
  city: string
  stateId: string
  state: string
  zipCode: string
}

export type UserLoginDTO = {
  role: string
  status: string
}

export type UserDTO = {
  id: string
  name: string
  email: string
  rg: string
  cpf: string
  gender: string
  phone: string
  status: string
  version: number
  createdAt?: string
  deletedAt?: string
  address?: AddressDTO
  login?: UserLoginDTO
}

export class UserViewModel {
  static toHTTP(user: User): UserDTO {
    const response: UserDTO = {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      rg: user.rg.value,
      cpf: user.cpf.value,
      gender: user.gender,
      phone: user.phone,
      status: user.status.value,
      version: user.version,
      createdAt: user.createdAt?.toISOString(),
      deletedAt: user.deletedAt?.toISOString(),
      address: user.address ? UserViewModel.mapAddress(user.address) : undefined,
      login: user.login ? UserViewModel.mapLogin(user.login) : undefined
    }
    return JSON.parse(JSON.stringify(response))
  }

  static mapAddress(address: Address): AddressDTO {
    return {
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhoodId: address.neighborhoodId.value,
      neighborhood: address.neighborhood ?? '',
      cityId: address.cityId.value,
      city: address.city ?? '',
      stateId: address.stateId.value,
      state: address.state ?? '',
      zipCode: address.zipCode
    }
  }

  static mapLogin(login: UserLogin): UserLoginDTO {
    return {
      role: login.role.value,
      status: login.status.value
    }
  }
}
