import { Validation } from '@/shared/presentation/protocols/validation'
import { ValidationComposite, RequiredFieldValidation } from '@/shared/validation/validators'

export const makeCreateUserLoginValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['password']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
