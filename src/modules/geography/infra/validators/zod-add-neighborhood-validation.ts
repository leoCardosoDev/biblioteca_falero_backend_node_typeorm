import { z } from 'zod'
import { ValidationError } from '@/shared/presentation/errors/validation-error'
import { Validation } from '@/shared/presentation/protocols'

export class ZodAddNeighborhoodValidator implements Validation {
  validate(input: unknown): Error | undefined {
    const schema = z.object({
      name: z.string().min(1),
      city_id: z.uuid()
    })

    const result = schema.safeParse(input)
    console.log('Zod Result:', JSON.stringify(result, null, 2))

    if (!result.success) {
      const error = result.error as z.ZodError
      const firstError = error.errors?.[0] || error.issues?.[0]
      return new ValidationError(firstError?.message ?? 'Validation failed')
    }

    return undefined
  }
}
