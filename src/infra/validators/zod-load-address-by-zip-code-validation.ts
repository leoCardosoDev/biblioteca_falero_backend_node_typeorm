import { z } from 'zod'
import { Validation, ValidationError } from '@/presentation'

export class ZodLoadAddressByZipCodeValidator implements Validation {
  validate(input: unknown): Error | undefined {
    const schema = z.object({
      zipCode: z.string().min(8)
    })

    const validation = schema.safeParse(input)
    if (!validation.success) {
      const details = validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        issue: issue.code,
        message: issue.message
      }))
      return new ValidationError(details)
    }
  }
}
