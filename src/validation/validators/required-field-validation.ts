import { Validation, MissingParamError } from '@/presentation'

export class RequiredFieldValidation implements Validation {
  constructor(private readonly fieldName: string) { }

  validate(input: unknown): Error | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(input as any)[this.fieldName]) {
      return new MissingParamError(this.fieldName)
    }
  }
}
