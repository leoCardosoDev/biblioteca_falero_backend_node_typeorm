import { Validation } from '@/shared/presentation/protocols/validation'
import { ValidationComposite } from '@/shared/validation/validators/validation-composite'
import { RequiredFieldValidation } from '@/shared/validation/validators/required-field-validation'

export const makeRefreshTokenValidation = (): Validation => {
  const validations: Validation[] = []
  validations.push(new RequiredFieldValidation('refreshToken'))
  return new ValidationComposite(validations)
}
