import { UserStatus } from '@/domain/value-objects/user-status'

describe('UserStatus Value Object', () => {
  test('Should create a valid UserStatus', () => {
    const status = UserStatus.create('active')
    expect(status).toBeInstanceOf(UserStatus)
    expect((status as UserStatus).value).toBe('active')
  })

  test('Should normalize status to lowercase', () => {
    const status = UserStatus.create('ACTIVE')
    expect(status).toBeInstanceOf(UserStatus)
    expect((status as UserStatus).value).toBe('active')
  })

  test('Should return an error if status is invalid', () => {
    const status = UserStatus.create('invalid_status')
    expect(status).toBeInstanceOf(Error)
    expect((status as Error).message).toBe('Invalid User Status')
  })
})
