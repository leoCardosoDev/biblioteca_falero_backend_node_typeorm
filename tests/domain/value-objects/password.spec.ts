import { Password } from '@/domain/value-objects/password'
import { InvalidPasswordError } from '@/domain/errors/invalid-password-error'

describe('Password Value Object', () => {
  describe('Validation Rules (RN01)', () => {
    test('Should return error if password is empty', () => {
      const sut = Password.create('')
      expect(sut.isLeft()).toBeTruthy()
      expect(sut.value).toEqual(new InvalidPasswordError('Password is required'))
    })

    test('Should return error if password is less than 8 characters', () => {
      const sut = Password.create('Ab1!')
      expect(sut.isLeft()).toBeTruthy()
      expect(sut.value).toEqual(new InvalidPasswordError('Password must have at least 8 characters'))
    })

    test('Should return error if password has no uppercase letter', () => {
      const sut = Password.create('abcdefg1!')
      expect(sut.isLeft()).toBeTruthy()
      expect(sut.value).toEqual(new InvalidPasswordError('Password must have at least 1 uppercase letter'))
    })

    test('Should return error if password has no number', () => {
      const sut = Password.create('Abcdefgh!')
      expect(sut.isLeft()).toBeTruthy()
      expect(sut.value).toEqual(new InvalidPasswordError('Password must have at least 1 number'))
    })

    test('Should return error if password has no special character', () => {
      const sut = Password.create('Abcdefgh1')
      expect(sut.isLeft()).toBeTruthy()
      expect(sut.value).toEqual(new InvalidPasswordError('Password must have at least 1 special character'))
    })

    test('Should create valid password with all requirements met', () => {
      const sut = Password.create('Abcdefgh1!')
      expect(sut.isRight()).toBeTruthy()
      expect(sut.value).toBeInstanceOf(Password)
      expect((sut.value as Password).value).toBe('Abcdefgh1!')
    })

    test('Should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '?']
      for (const char of specialChars) {
        const password = `Abcdef1${char}`
        const sut = Password.create(password)
        expect(sut.isRight()).toBeTruthy()
      }
    })
  })
})
