import { Validation } from '@/presentation/protocols/validation'
import { ValidationComposite, RequiredFieldValidation } from '@/validation/validators'

export const makeCreateUserLoginValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['userId', 'password']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
