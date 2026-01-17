import { ValidationComposite, RequiredFieldValidation } from '@/shared/validation/validators'
import { Validation } from '@/shared/presentation/protocols/validation'

export const makeAddUserLoginValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['password', 'role', 'status']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
