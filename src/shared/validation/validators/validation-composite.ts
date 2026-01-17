import { Validation } from '@/shared/presentation/protocols/validation'

export class ValidationComposite implements Validation {
  constructor(private readonly validations: Validation[]) { }

  validate(input: unknown): Error | undefined {
    for (const validation of this.validations) {
      const error = validation.validate(input)
      if (error) {
        return error
      }
    }
  }
}
