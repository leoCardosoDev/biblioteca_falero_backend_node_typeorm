import { makeAddUserValidation } from '@/main/factories/add-user-validation-factory'
import { ValidationComposite, RequiredFieldValidation } from '@/validation/validators'
import { Validation } from '@/presentation/protocols/validation'

jest.mock('@/validation/validators/validation-composite')

describe('AddUserValidation Factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeAddUserValidation()
    const validations: Validation[] = []
    for (const field of ['name', 'email', 'rg', 'cpf', 'gender']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
