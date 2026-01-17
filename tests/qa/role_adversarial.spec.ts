
import { Role } from '@/modules/identity/domain/entities/role'
import { Id } from '@/shared/domain/value-objects/id'
import { randomUUID } from 'crypto'

describe('QA Adversarial Scenarios - Role PowerLevel', () => {

  test('Should handle negative power levels (Assumption: Allowed but discouraged)', () => {
    const sut = Role.create({
      id: Id.create(randomUUID()),
      slug: 'banned',
      powerLevel: -10
    })
    expect(sut.powerLevel).toBe(-10)
  })

  test('Should handle float power levels (TypeOrm int will probably truncate, but Domain is number)', () => {
    // Domain is pure TS, so it accepts number. 
    // We are checking if Domain Layer has any validation against it.
    const sut = Role.create({
      id: Id.create(randomUUID()),
      slug: 'weird_role',
      powerLevel: 50.5
    })
    expect(sut.powerLevel).toBe(50.5)
  })

  test('Should rely on default 0 if undefined', () => {
    const sut = Role.create({
      id: Id.create(randomUUID()),
      slug: 'minimal'
    })
    expect(sut.powerLevel).toBe(0)
  })
})
