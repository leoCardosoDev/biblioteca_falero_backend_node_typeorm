import { UserStatus } from '@/domain/models/user-status'

describe('UserStatus Value Object', () => {
  test('Should return correct values', () => {
    expect(UserStatus.active).toBe('ACTIVE')
    expect(UserStatus.inactive).toBe('INACTIVE')
    expect(UserStatus.blocked).toBe('BLOCKED')
  })
})
