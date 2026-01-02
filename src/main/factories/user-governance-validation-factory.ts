
import { ValidationComposite, RequiredFieldValidation } from '@/validation/validators'
import { Validation } from '@/presentation/protocols/validation'

export const makeUpdateUserStatusValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['status']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}

export const makeUpdateUserRoleValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['roleId']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
