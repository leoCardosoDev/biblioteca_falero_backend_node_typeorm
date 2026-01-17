import { ValidationComposite, RequiredFieldValidation } from '@/shared/validation/validators'
import { Validation } from '@/shared/presentation/protocols/validation'

export const makeAddUserValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['name', 'email', 'rg', 'cpf', 'gender']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
