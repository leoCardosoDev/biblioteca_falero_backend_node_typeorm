import { UserMapper } from '@/presentation/dtos/user-mapper'
import { UserModel } from '@/domain/models/user'
import { Id } from '@/domain/value-objects/id'
import { Name } from '@/domain/value-objects/name'
import { Email } from '@/domain/value-objects/email'
import { Rg } from '@/domain/value-objects/rg'
import { Cpf } from '@/domain/value-objects/cpf'
import { UserStatus } from '@/domain/value-objects/user-status'
import { UserRole } from '@/domain/value-objects/user-role'
import { Address } from '@/domain/value-objects'

describe('UserMapper', () => {
  test('Should map UserModel to UserDTO correctly', () => {
    const userModel: UserModel = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('Any Name') as Name,
      email: Email.create('any_email@mail.com'),
      rg: Rg.create('123456789') as Rg,
      cpf: Cpf.create('529.982.247-25'),
      gender: 'male',
      phone: '123456789',
      status: UserStatus.create('ACTIVE') as UserStatus,
      version: 1,
      address: {
        street: 'Any Street',
        number: '123',
        complement: 'Apt 1',
        neighborhoodId: { value: 'any_neighborhood_id' } as Id,
        cityId: { value: 'any_city_id' } as Id,
        stateId: { value: 'any_state_id' } as Id,
        zipCode: '12345678'
      } as Address, // Mocking Address simply
      login: {
        role: UserRole.create('STUDENT') as UserRole,
        status: UserStatus.create('ACTIVE') as UserStatus
      }
    }

    const userDTO = UserMapper.toDTO(userModel)

    expect(userDTO).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Any Name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'male',
      phone: '123456789',
      status: 'ACTIVE',
      version: 1,
      address: {
        street: 'Any Street',
        number: '123',
        complement: 'Apt 1',
        neighborhoodId: 'any_neighborhood_id',
        cityId: 'any_city_id',
        stateId: 'any_state_id',
        zipCode: '12345678'
      },
      login: {
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    })
  })

  test('Should map UserModel to UserDTO without optional fields', () => {
    const userModel: UserModel = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('Any Name') as Name,
      email: Email.create('any_email@mail.com'),
      rg: Rg.create('123456789') as Rg,
      cpf: Cpf.create('529.982.247-25'),
      gender: 'male',
      status: UserStatus.create('ACTIVE') as UserStatus,
      version: 1
    }

    const userDTO = UserMapper.toDTO(userModel)

    expect(userDTO).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Any Name',
      email: 'any_email@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'male',
      status: 'ACTIVE',
      version: 1,
      phone: undefined,
      address: undefined,
      login: undefined
    })
  })
})
