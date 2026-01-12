import { z } from 'zod'
import { Validation } from '@/application/protocols/validation'
import { ValidationError } from '@/application/errors/validation-error'

export class ZodAddNeighborhoodValidator implements Validation {
  validate(input: unknown): Error | undefined {
    const schema = z.object({
      name: z.string().min(1),
      city_id: z.string().uuid()
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
