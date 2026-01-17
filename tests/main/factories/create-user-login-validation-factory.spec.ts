import { makeCreateUserLoginValidation } from '@/main/factories/create-user-login-validation-factory'
import { ValidationComposite, RequiredFieldValidation } from '@/shared/validation/validators'
import { Validation } from '@/shared/presentation/protocols/validation'

jest.mock('@/shared/validation/validators', () => ({
  ValidationComposite: jest.fn(),
  RequiredFieldValidation: jest.fn()
}))

describe('CreateUserLoginValidationFactory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeCreateUserLoginValidation()
    const validations: Validation[] = []
    for (const field of ['password']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
