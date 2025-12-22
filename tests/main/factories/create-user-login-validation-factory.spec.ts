import { makeCreateUserLoginValidation } from '@/main/factories/create-user-login-validation-factory'
import { ValidationComposite, RequiredFieldValidation } from '@/validation/validators'
import { Validation } from '@/presentation/protocols'

jest.mock('@/validation/validators/validation-composite')

describe('CreateUserLoginValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeCreateUserLoginValidation()
    const validations: Validation[] = []
    for (const field of ['userId', 'password']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
