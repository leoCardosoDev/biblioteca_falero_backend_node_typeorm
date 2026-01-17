import { Role, Permission, RoleProps } from '@/modules/identity/domain/entities'
import { Id } from '@/shared/domain/value-objects/id'

describe('Role Entity', () => {
  // ... existing tests code ...

  test('Should create a valid Role', () => {
    const sut = Role.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      slug: 'admin',
      description: 'System Administrator'
    })
    expect(sut.id).toBeDefined()
    expect(sut.slug).toBe('admin')
    expect(sut.description).toBe('System Administrator')
    expect(sut.permissions).toEqual([])
  })

  test('Should create a Role with powerLevel', () => {
    const sut = Role.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      slug: 'admin',
      powerLevel: 100
    })
    expect(sut.powerLevel).toBe(100)
  })

  test('Should default powerLevel to 0 if not provided', () => {
    const sut = Role.create({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      slug: 'member'
    })
    expect(sut.powerLevel).toBe(0)
  })

  test('Should add permission', () => {
    const sut = Role.create({ id: Id.create('550e8400-e29b-41d4-a716-446655440000'), slug: 'admin' })
    const permission = Permission.create({ id: Id.create('550e8400-e29b-41d4-a716-446655440000'), slug: 'users:read' })

    sut.addPermission(permission)

    expect(sut.permissions).toHaveLength(1)
    expect(sut.permissions[0].slug).toBe('users:read')
  })

  test('Should not add duplicate permission', () => {
    const sut = Role.create({ id: Id.create('550e8400-e29b-41d4-a716-446655440000'), slug: 'admin' })
    const permission = Permission.create({ id: Id.create('550e8400-e29b-41d4-a716-446655440000'), slug: 'users:read' })

    sut.addPermission(permission)
    sut.addPermission(permission)

    expect(sut.permissions).toHaveLength(1)
  })
  test('Should throw error if ID is missing', () => {
    expect(() => {
      Role.create({
        slug: 'admin'
      } as unknown as RoleProps)
    }).toThrow('ID is required')
  })
})
