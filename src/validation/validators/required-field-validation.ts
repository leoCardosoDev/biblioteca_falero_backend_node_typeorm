import { Validation } from '@/presentation/protocols/validation'
import { MissingParamError } from '@/presentation/errors'

export class RequiredFieldValidation implements Validation {
  constructor(private readonly fieldName: string) { }

  validate(input: Record<string, unknown>): Error | undefined {
    if (!input[this.fieldName]) {
      return new MissingParamError(this.fieldName)
    }
  }
}

