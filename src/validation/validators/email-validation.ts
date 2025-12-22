import { Validation } from '@/presentation/protocols/validation'
import { InvalidParamError } from '@/presentation/errors'
import { EmailValidator } from '@/validation/protocols/email-validator'

export class EmailValidation implements Validation {
  constructor(
    private readonly fieldName: string,
    private readonly emailValidator: EmailValidator
  ) { }

  validate(input: Record<string, unknown>): Error | undefined {
    const email = input[this.fieldName]
    if (typeof email !== 'string') {
      return new InvalidParamError(this.fieldName)
    }
    const isValid = this.emailValidator.isValid(email)
    if (!isValid) {
      return new InvalidParamError(this.fieldName)
    }
  }
}

