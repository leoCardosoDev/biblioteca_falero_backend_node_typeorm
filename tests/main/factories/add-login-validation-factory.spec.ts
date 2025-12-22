import { makeAddLoginValidation } from '@/main/factories/add-login-validation-factory'
import { ValidationComposite, RequiredFieldValidation, EmailValidation } from '@/validation/validators'
import { EmailValidatorAdapter } from '@/infra/validators/email-validator-adapter'
import { Validation } from '@/presentation/protocols'

jest.mock('@/validation/validators/validation-composite')

describe('AddLoginValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeAddLoginValidation()
    const validations: Validation[] = []
    for (const field of ['email', 'password', 'userId']) {
      validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
