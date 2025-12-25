import { InvalidPasswordError } from '@/domain/errors/invalid-password-error'

export class Password {
  private constructor(readonly value: string) { }

  static create(password: string): Password | InvalidPasswordError {
    const validationResult = Password.validate(password)
    if (validationResult !== null) {
      return validationResult
    }
    return new Password(password)
  }

  private static validate(password: string): InvalidPasswordError | null {
    if (!password) {
      return new InvalidPasswordError('Password is required')
    }
    if (password.length < 8) {
      return new InvalidPasswordError('Password must have at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      return new InvalidPasswordError('Password must have at least 1 uppercase letter')
    }
    if (!/[0-9]/.test(password)) {
      return new InvalidPasswordError('Password must have at least 1 number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return new InvalidPasswordError('Password must have at least 1 special character')
    }
    return null
  }
}
