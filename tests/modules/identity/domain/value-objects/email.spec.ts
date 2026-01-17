import { Email } from '@/modules/identity/domain/value-objects/email'

describe('Email Value Object', () => {
  test('Should create a valid Email', () => {
    const email = Email.create('valid@mail.com')
    expect(email.value).toBe('valid@mail.com')
  })

  test('Should throw if email is invalid', () => {
    expect(() => Email.create('invalid-email')).toThrow()
  })

  test('Should throw if email is empty', () => {
    expect(() => Email.create('')).toThrow()
  })

  test('Should normalize email to lowercase', () => {
    const email = Email.create('Valid@Mail.COM')
    expect(email.value).toBe('valid@mail.com')
  })
})
