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
})
