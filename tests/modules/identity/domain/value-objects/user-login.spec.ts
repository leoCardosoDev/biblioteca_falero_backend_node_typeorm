import { UserLogin } from '@/modules/identity/domain/value-objects/user-login'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'
import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

describe('UserLogin Value Object', () => {
  test('Should create a UserLogin instance', () => {
    const role = UserRole.create('admin')
    const status = UserStatus.create('active')
    const userLogin = UserLogin.create(role as UserRole, status as UserStatus)
    expect(userLogin.role).toBe(role)
    expect(userLogin.status).toBe(status)
  })

  test('Should restore a UserLogin instance', () => {
    const role = UserRole.create('admin')
    const status = UserStatus.create('active')
    const userLogin = UserLogin.restore(role as UserRole, status as UserStatus)
    expect(userLogin.role).toBe(role)
    expect(userLogin.status).toBe(status)
  })
})
