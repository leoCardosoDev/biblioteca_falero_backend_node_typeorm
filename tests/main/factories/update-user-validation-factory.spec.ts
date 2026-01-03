import { makeUpdateUserValidation } from '@/main/factories/update-user-validation-factory'
import { ValidationComposite, RequiredFieldValidation } from '@/validation/validators'
import { Validation } from '@/presentation/protocols/validation'

jest.mock('@/validation/validators', () => ({
  ValidationComposite: jest.fn(),
  RequiredFieldValidation: jest.fn()
}))

describe('UpdateUserValidationFactory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeUpdateUserValidation()
    const validations: Validation[] = []
    for (const field of ['id']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
