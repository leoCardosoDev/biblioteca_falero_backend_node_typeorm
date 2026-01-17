import { UserStatus } from '@/modules/identity/domain/value-objects/user-status'

describe('UserStatus Value Object', () => {
  test('Should return correct values', () => {
    const active = UserStatus.create('ACTIVE') as UserStatus
    const inactive = UserStatus.create('INACTIVE') as UserStatus
    const blocked = UserStatus.create('BLOCKED') as UserStatus

    expect(active.value).toBe('ACTIVE')
    expect(inactive.value).toBe('INACTIVE')
    expect(blocked.value).toBe('BLOCKED')
  })

  test('Should normalize to uppercase', () => {
    const status = UserStatus.create('active') as UserStatus
    expect(status.value).toBe('ACTIVE')
  })

  test('Should return an error if status is invalid', () => {
    const error = UserStatus.create('invalid_status')
    expect(error).toBeInstanceOf(Error)
  })
})
