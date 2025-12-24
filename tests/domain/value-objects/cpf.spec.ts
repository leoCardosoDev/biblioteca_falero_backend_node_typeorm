import { Cpf } from '@/domain/value-objects/cpf'

describe('Cpf Value Object', () => {
  test('Should create a valid CPF', () => {
    const cpf = Cpf.create('529.982.247-25')
    expect(cpf.value).toBe('52998224725')
  })

  test('Should create a valid CPF from unformatted string', () => {
    const cpf = Cpf.create('52998224725')
    expect(cpf.value).toBe('52998224725')
  })

  test('Should throw if CPF has invalid check digits', () => {
    expect(() => Cpf.create('529.982.247-99')).toThrow()
  })

  test('Should throw if CPF is empty', () => {
    expect(() => Cpf.create('')).toThrow()
  })

  test('Should throw if CPF has wrong length', () => {
    expect(() => Cpf.create('123456789')).toThrow()
  })

  test('Should throw if CPF has all same digits', () => {
    expect(() => Cpf.create('111.111.111-11')).toThrow()
  })

  test('Should throw if first digit is valid but second is invalid', () => {
    // CPF 529.982.247-25 is valid. Changing last digit (25 -> 24) should fail on second digit check
    expect(() => Cpf.create('529.982.247-24')).toThrow()
  })

  test('Should accept CPF where remainder equals 10 (edge case)', () => {
    // CPF 12345678909: first check sum=210, (210*10)%11=10, triggers first remainder===10 branch
    const cpf = Cpf.create('12345678909')
    expect(cpf.value).toBe('12345678909')
  })

  test('Should accept CPF where second remainder equals 10 (edge case)', () => {
    // CPF 00000001830: second check triggers remainder===10 branch
    const cpf = Cpf.create('00000001830')
    expect(cpf.value).toBe('00000001830')
  })
})
