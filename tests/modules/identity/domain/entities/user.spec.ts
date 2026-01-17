import { User, UserProps } from '@/modules/identity/domain/entities/user'

import { Id } from '@/shared/domain/value-objects/id'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { Address } from '@/modules/identity/domain/value-objects/address'

const makeFakeUser = (): User => User.create({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('valid_name') as Name,
  email: Email.create('valid_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25') as Cpf,
  gender: 'any_gender',
  version: 1,
  status: UserStatus.create('ACTIVE') as UserStatus
})

const makeFakeAddress = (): Address => Address.create({
  street: 'new_street',
  number: '321',
  zipCode: '87654321',
  cityId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
  neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440003'),
  stateId: Id.create('550e8400-e29b-41d4-a716-446655440001')
}) as Address

describe('User Entity', () => {
  test('Should create a User with correct props', () => {
    const user = makeFakeUser()
    expect(user).toBeInstanceOf(User)
    expect(user.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('changeAddress should return a new User instance with updated address', () => {
    const user = makeFakeUser()
    const newAddress = makeFakeAddress()

    const updatedUser = user.changeAddress(newAddress) as User

    expect(updatedUser).toBeInstanceOf(User)
    expect(updatedUser.id.value).toBe(user.id.value)
    expect(updatedUser.address).toEqual(newAddress)
    expect(updatedUser).not.toBe(user) // Immutability check
  })

  test('changeName should return a new User instance with updated name', () => {
    const user = makeFakeUser()
    const newName = Name.create('new_name') as Name

    const updatedUser = user.changeName(newName) as User

    expect(updatedUser).toBeInstanceOf(User)
    expect(updatedUser.id.value).toBe(user.id.value)
    expect(updatedUser.name.value).toBe('new_name')
    expect(updatedUser).not.toBe(user) // Immutability check
  })
  test('Should throw error if ID is missing', () => {
    expect(() => {
      User.create({
        name: Name.create('valid_name'),
        email: Email.create('valid_email@mail.com')
      } as unknown as UserProps)
    }).toThrow('ID is required')
  })

  test('Should default version to 0 if not provided', () => {
    const user = User.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('valid_name') as Name,
      email: Email.create('valid_email@mail.com'),
      rg: Rg.create('123456789') as Rg,
      cpf: Cpf.create('529.982.247-25') as Cpf,
      gender: 'any_gender',
      status: UserStatus.create('ACTIVE') as UserStatus
    })
    expect(user.version).toBe(0)
  })

  test('Should restore a User', () => {
    const props = {
      name: Name.create('valid_name') as Name,
      email: Email.create('valid_email@mail.com'),
      rg: Rg.create('123456789') as Rg,
      cpf: Cpf.create('529.982.247-25') as Cpf,
      gender: 'any_gender',
      status: UserStatus.create('ACTIVE') as UserStatus
    }
    const id = Id.create('550e8400-e29b-41d4-a716-446655440000')
    const user = User.restore(props, id)
    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe(id)
  })
})
