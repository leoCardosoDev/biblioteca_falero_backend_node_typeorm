import { makeAddUserValidation } from '@/main/factories/add-user-validation-factory'
import { ValidationComposite, RequiredFieldValidation, EmailValidation, DateValidation } from '@/validation/validators'
import { Validation } from '@/presentation/protocols/validation'
import { EmailValidator } from '@/validation/protocols/email-validator'

jest.mock('@/validation/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(_email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

describe('AddUserValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeAddUserValidation()
    const validations: Validation[] = []
    for (const field of ['name', 'email', 'rg', 'cpf', 'dataNascimento']) {
      validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new EmailValidation('email', makeEmailValidator()))
    validations.push(new DateValidation('dataNascimento'))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
