import { UserRole } from '@/domain/value-objects/user-role'

describe('UserRole Value Object', () => {
  test('Should create a valid UserRole for ADMIN', () => {
    const role = UserRole.create('ADMIN')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('ADMIN')
  })

  test('Should create a valid UserRole for LIBRARIAN', () => {
    const role = UserRole.create('LIBRARIAN')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('LIBRARIAN')
  })

  test('Should create a valid UserRole for PROFESSOR', () => {
    const role = UserRole.create('PROFESSOR')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('PROFESSOR')
  })

  test('Should create a valid UserRole for STUDENT', () => {
    const role = UserRole.create('STUDENT')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('STUDENT')
  })

  test('Should normalize role to uppercase', () => {
    const role = UserRole.create('admin')
    expect(role).toBeInstanceOf(UserRole)
    expect((role as UserRole).value).toBe('ADMIN')
  })

  test('Should return an error if role is invalid (e.g., MEMBER)', () => {
    const role = UserRole.create('MEMBER')
    expect(role).toBeInstanceOf(Error)
    expect((role as Error).message).toBe('Invalid User Role')
  })

  test('Should return an error if role is completely invalid', () => {
    const role = UserRole.create('invalid_role')
    expect(role).toBeInstanceOf(Error)
    expect((role as Error).message).toBe('Invalid User Role')
  })

  test('Should return correct power level', () => {
    expect((UserRole.create('ADMIN') as UserRole).powerLevel).toBe(100)
    expect((UserRole.create('LIBRARIAN') as UserRole).powerLevel).toBe(50)
    expect((UserRole.create('PROFESSOR') as UserRole).powerLevel).toBe(10)
    expect((UserRole.create('STUDENT') as UserRole).powerLevel).toBe(0)
  })
})
