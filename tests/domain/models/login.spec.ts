import { Login, LoginProps } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'

describe('Login Entity', () => {
  // ... tests ...

  test('Should create a valid Login', () => {
    const userId = Id.create('550e8400-e29b-41d4-a716-446655440001')
    const roleId = Id.create('550e8400-e29b-41d4-a716-446655440002')
    const email = Email.create('any@mail.com')

    const sut = Login.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      userId,
      roleId,
      email,
      passwordHash: 'hashed_password',
      isActive: true
    })

    expect(sut.id).toBeDefined()
    expect(sut.userId).toEqual(userId)
    expect(sut.roleId).toEqual(roleId)
    expect(sut.email).toEqual(email)
    expect(sut.passwordHash).toBe('hashed_password')
    expect(sut.isActive).toBe(true)
  })

  test('Should default isActive to true if not provided', () => {
    const userId = Id.create('550e8400-e29b-41d4-a716-446655440001')
    const roleId = Id.create('550e8400-e29b-41d4-a716-446655440002')
    const email = Email.create('any@mail.com')

    const sut = Login.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      userId,
      roleId,
      email,
      passwordHash: 'hashed_password'
    })

    expect(sut.isActive).toBe(true)
  })

  test('Should set isActive to false if provided', () => {
    const userId = Id.create('550e8400-e29b-41d4-a716-446655440001')
    const roleId = Id.create('550e8400-e29b-41d4-a716-446655440002')
    const email = Email.create('any@mail.com')

    const sut = Login.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      userId,
      roleId,
      email,
      passwordHash: 'hashed_password',
      isActive: false
    })

    expect(sut.isActive).toBe(false)
  })
  test('Should throw error if ID is missing', () => {
    expect(() => {
      Login.create({
        userId: Id.create('550e8400-e29b-41d4-a716-446655440001'),
        roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
        email: Email.create('any@mail.com'),
        passwordHash: 'hashed_password'
      } as unknown as LoginProps)
    }).toThrow('ID is required')
  })
})
