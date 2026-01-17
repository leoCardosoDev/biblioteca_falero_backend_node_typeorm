import { Permission, PermissionProps } from '@/modules/identity/domain/entities/permission'
import { Id } from '@/shared/domain/value-objects/id'

describe('Permission Entity', () => {
  test('Should create a valid Permission', () => {
    const sut = Permission.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      slug: 'users:read',
      description: 'Allows reading users'
    })
    expect(sut.id).toBeDefined()
    expect(sut.slug).toBe('users:read')
    expect(sut.description).toBe('Allows reading users')
  })

  test('Should update description', () => {
    const sut = Permission.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      slug: 'users:read',
      description: 'Old description'
    })
    sut.updateDescription('New description')
    expect(sut.description).toBe('New description')
  })
  test('Should throw error if ID is missing', () => {
    expect(() => {
      Permission.create({
        slug: 'users:read'
      } as unknown as PermissionProps)
    }).toThrow('ID is required')
  })

  test('Should default description to empty string if not provided', () => {
    const sut = Permission.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      slug: 'users:read'
    })
    expect(sut.description).toBe('')
  })
})
