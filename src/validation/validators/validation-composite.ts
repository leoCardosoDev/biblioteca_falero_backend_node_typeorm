import { Validation } from '@/presentation/protocols/validation'

export class ValidationComposite implements Validation {
  constructor(private readonly validations: Validation[]) { }

  validate(input: Record<string, unknown>): Error | undefined {
    for (const validation of this.validations) {
      const error = validation.validate(input)
      if (error) {
        return error
      }
    }
  }
}
