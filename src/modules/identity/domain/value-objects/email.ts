import { InvalidEmailError } from '@/modules/identity/domain/errors/invalid-email-error'

export class Email {
  private readonly email: string

  private constructor(email: string) {
    this.email = email
  }

  get value(): string {
    return this.email
  }

  static create(email: string): Email {
    if (!email || !Email.isValid(email)) {
      throw new InvalidEmailError()
    }
    return new Email(email.toLowerCase())
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  static restore(email: string): Email {
    return new Email(email)
  }
}
