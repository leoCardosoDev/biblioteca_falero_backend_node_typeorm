import { z } from 'zod'
import { ValidationError } from '@/shared/presentation/errors/validation-error'
import { Validation } from '@/shared/presentation/protocols'

export class ZodLoadAddressByZipCodeValidator implements Validation {
  validate(input: unknown): Error | undefined {
    const schema = z.object({
      zipCode: z.string().length(8)
    })

    const result = schema.safeParse(input)

    if (!result.success) {
      const error = result.error as z.ZodError
      const firstError = error.errors?.[0] || error.issues?.[0]
      return new ValidationError(firstError?.message ?? 'Validation failed')
    }

    return undefined
  }
}
