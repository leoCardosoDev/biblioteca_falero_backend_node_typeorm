import { Login } from '@/domain/models/login'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'

describe('Login Entity', () => {
  test('Should create a valid Login', () => {
    const userId = Id.generate()
    const roleId = Id.generate()
    const email = Email.create('any@mail.com')

    const sut = Login.create({
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
    const userId = Id.generate()
    const roleId = Id.generate()
    const email = Email.create('any@mail.com')

    const sut = Login.create({
      userId,
      roleId,
      email,
      passwordHash: 'hashed_password'
    })

    expect(sut.isActive).toBe(true)
  })

  test('Should set isActive to false if provided', () => {
    const userId = Id.generate()
    const roleId = Id.generate()
    const email = Email.create('any@mail.com')

    const sut = Login.create({
      userId,
      roleId,
      email,
      passwordHash: 'hashed_password',
      isActive: false
    })

    expect(sut.isActive).toBe(false)
  })
})
