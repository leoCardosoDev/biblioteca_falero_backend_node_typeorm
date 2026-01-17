import { makeUpdateUserValidation } from '@/main/factories/update-user-validation-factory'
import { ValidationComposite, RequiredFieldValidation } from '@/shared/validation/validators'
import { Validation } from '@/shared/presentation/protocols/validation'

jest.mock('@/shared/validation/validators', () => ({
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
