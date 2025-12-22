import { Validation } from '@/presentation/protocols/validation'
import { MissingParamError } from '@/presentation/errors'

export class RequiredFieldValidation implements Validation {
  constructor(private readonly fieldName: string) { }

  validate(input: unknown): Error | undefined {
    if (typeof input !== 'object' || input === null) {
      return new MissingParamError(this.fieldName)
    }
    const field = (input as Record<string, unknown>)[this.fieldName]
    if (!field) {
      return new MissingParamError(this.fieldName)
    }
  }
}
