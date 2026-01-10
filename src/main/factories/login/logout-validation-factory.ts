import { Validation } from '@/presentation/protocols/validation'
import { ValidationComposite } from '@/validation/validators/validation-composite'
import { RequiredFieldValidation } from '@/validation/validators/required-field-validation'

export const makeLogoutValidation = (): Validation => {
  const validations: Validation[] = []
  validations.push(new RequiredFieldValidation('refreshToken'))
  return new ValidationComposite(validations)
}
