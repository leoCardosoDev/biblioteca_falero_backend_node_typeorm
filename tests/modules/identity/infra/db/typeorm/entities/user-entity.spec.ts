import { UserTypeOrmEntity, dateTransformer } from '@/modules/identity/infra/db/typeorm/entities/user-entity'

describe('UserTypeOrmEntity', () => {
  it('should be defined', () => {
    expect(new UserTypeOrmEntity()).toBeDefined()
  })
})

describe('Date Transformer', () => {
  test('Should return the same value if to is called', () => {
    const value = 'any_value'
    expect(dateTransformer.to(value)).toBe(value)
  })

  test('Should return the same value if from is called with a string', () => {
    const value = '2021-01-01'
    expect(dateTransformer.from(value)).toBe(value)
  })

  test('Should return a formatted string if from is called with a Date', () => {
    const value = new Date('2021-01-01T12:00:00Z')
    const result = dateTransformer.from(value)
    expect(result).toBe('2021-01-01')
  })
})
