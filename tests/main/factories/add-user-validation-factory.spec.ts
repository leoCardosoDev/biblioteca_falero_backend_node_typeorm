import { makeAddUserValidation } from '@/main/factories/add-user-validation-factory'
import { ValidationComposite, RequiredFieldValidation } from '@/shared/validation/validators'
import { Validation } from '@/shared/presentation/protocols/validation'

jest.mock('@/shared/validation/validators', () => ({
  ValidationComposite: jest.fn(),
  RequiredFieldValidation: jest.fn()
}))

describe('AddUserValidationFactory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeAddUserValidation()
    const validations: Validation[] = []
    for (const field of ['name', 'email', 'rg', 'cpf', 'gender']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
