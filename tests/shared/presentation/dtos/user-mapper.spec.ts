import { UserMapper } from '@/modules/identity/infra/db/typeorm/mappers/user-mapper'
import { UserModel } from '@/modules/identity/domain/models/user'
import { Id } from '@/shared/domain/value-objects/id'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'
import { Address } from '@/modules/identity/domain/value-objects'

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
      createdAt: new Date('2026-01-01T10:00:00Z'),
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
      createdAt: '2026-01-01T10:00:00.000Z',
      address: {
        street: 'Any Street',
        number: '123',
        complement: 'Apt 1',
        neighborhoodId: 'any_neighborhood_id',
        neighborhood: undefined,
        cityId: 'any_city_id',
        city: undefined,
        stateId: 'any_state_id',
        state: undefined,
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
      createdAt: undefined,
      phone: undefined,
      address: undefined,
      login: undefined
    })
  })
})
