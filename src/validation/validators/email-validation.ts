import { Validation } from '@/presentation/protocols/validation'
import { InvalidParamError } from '@/presentation/errors'
import { EmailValidator } from '@/validation/protocols/email-validator'

export class EmailValidation implements Validation {
  constructor(
    private readonly fieldName: string,
    private readonly emailValidator: EmailValidator
  ) { }

  validate(input: unknown): Error | undefined {
    if (typeof input !== 'object' || input === null) return undefined
    const email = (input as Record<string, unknown>)[this.fieldName]
    if (typeof email !== 'string') return undefined

    const isValid = this.emailValidator.isValid(email)
    if (!isValid) {
      return new InvalidParamError(this.fieldName)
    }
  }
}
