import { Id } from '@/domain/value-objects/id'

describe('Id Value Object', () => {
  test('Should create an Id from a valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const id = Id.create(uuid)
    expect(id.value).toBe(uuid)
  })

  test('Should throw if UUID is invalid', () => {
    expect(() => Id.create('not-a-uuid')).toThrow()
  })

  test('Should throw if UUID is empty', () => {
    expect(() => Id.create('')).toThrow()
  })


})
