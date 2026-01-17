import { Validation } from '@/shared/presentation/protocols/validation'
import { MissingParamError } from '@/shared/presentation/errors'

export class RequiredFieldValidation implements Validation {
  constructor(private readonly fieldName: string) { }

  validate(input: unknown): Error | undefined {
    if (!input || typeof input !== 'object' || !((input as Record<string, unknown>)[this.fieldName])) {
      return new MissingParamError(this.fieldName)
    }
  }
}
