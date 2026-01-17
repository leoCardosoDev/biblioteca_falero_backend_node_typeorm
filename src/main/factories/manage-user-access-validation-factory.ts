
import { ValidationComposite } from '@/shared/validation/validators'
import { Validation } from '@/shared/presentation/protocols/validation'

export const makeManageUserAccessValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  return new ValidationComposite(validations)
}
