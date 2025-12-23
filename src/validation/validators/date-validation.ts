import { Validation } from '@/presentation/protocols/validation'
import { InvalidParamError } from '@/presentation/errors'

export class DateValidation implements Validation {
  constructor(private readonly fieldName: string) { }

  validate(input: Record<string, unknown>): Error | undefined {
    const dateValue = input[this.fieldName]
    if (typeof dateValue !== 'string') {
      return new InvalidParamError(this.fieldName)
    }
    // Validate format: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateValue)) {
      return new InvalidParamError(this.fieldName)
    }
    // Validate it's a real date (e.g., 2024-02-30 would be invalid)
    const [year, month, day] = dateValue.split('-').map(Number)
    const dateObject = new Date(year, month - 1, day)
    const isValidDate =
      dateObject.getFullYear() === year &&
      dateObject.getMonth() === month - 1 &&
      dateObject.getDate() === day
    if (!isValidDate) {
      return new InvalidParamError(this.fieldName)
    }
  }
}
