import { State } from '@/modules/geography/domain/entities/state'
import { InvalidStateError } from '@/modules/geography/domain/errors'
import { Id } from '@/shared/domain/value-objects/id'

describe('State Entity', () => {
  const makeValidProps = () => ({
    id: Id.create('550e8400-e29b-41d4-a716-446655440000') as Id,
    name: 'São Paulo',
    uf: 'SP'
  })

  describe('create', () => {
    test('Should return InvalidStateError if name is empty', () => {
      const props = { ...makeValidProps(), name: '' }
      const result = State.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidStateError)
      expect((result.value as InvalidStateError).message).toBe('State name is required')
    })

    test('Should return InvalidStateError if name is only whitespace', () => {
      const props = { ...makeValidProps(), name: '   ' }
      const result = State.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidStateError)
    })

    test('Should return InvalidStateError if uf is empty', () => {
      const props = { ...makeValidProps(), uf: '' }
      const result = State.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidStateError)
      expect((result.value as InvalidStateError).message).toBe('State UF must be exactly 2 characters')
    })

    test('Should return InvalidStateError if uf is not 2 characters', () => {
      const props = { ...makeValidProps(), uf: 'SPX' }
      const result = State.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidStateError)
      expect((result.value as InvalidStateError).message).toBe('State UF must be exactly 2 characters')
    })

    test('Should return InvalidStateError if uf is 1 character', () => {
      const props = { ...makeValidProps(), uf: 'S' }
      const result = State.create(props)
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidStateError)
    })

    test('Should create valid state with trimmed name and uppercase uf', () => {
      const props = { ...makeValidProps(), name: '  São Paulo  ', uf: 'sp' }
      const result = State.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as State).name).toBe('São Paulo')
      expect((result.value as State).uf).toBe('SP')
      expect((result.value as State).id).toEqual(props.id)
    })

    test('Should trim uf and convert to uppercase', () => {
      const props = { ...makeValidProps(), uf: ' sp ' }
      const result = State.create(props)
      expect(result.isRight()).toBe(true)
      expect((result.value as State).uf).toBe('SP')
    })
  })

  describe('restore', () => {
    test('Should restore state without validation', () => {
      const props = makeValidProps()
      const result = State.restore(props)
      expect(result).toBeInstanceOf(State)
      expect(result.name).toBe('São Paulo')
      expect(result.uf).toBe('SP')
      expect(result.id).toEqual(props.id)
    })
  })
})
