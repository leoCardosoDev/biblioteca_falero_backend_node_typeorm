import { UserRole } from '@/domain/value-objects/user-role'

describe('UserRole Value Object', () => {
  test('Should create a valid UserRole', () => {
    const role = UserRole.create('ADMIN')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('ADMIN')
  })

  test('Should normalize role to uppercase', () => {
    const role = UserRole.create('admin')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('ADMIN')
  })

  test('Should return an error if role is invalid', () => {
    const role = UserRole.create('invalid_role')
    expect(role).toBeInstanceOf(Error)
    expect((role as Error).message).toBe('Invalid User Role')
  })
})
