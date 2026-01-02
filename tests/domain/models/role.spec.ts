import { Role } from '@/domain/models/role'
import { Permission } from '@/domain/models/permission'

describe('Role Entity', () => {
  test('Should create a valid Role', () => {
    const sut = Role.create({
      slug: 'admin',
      description: 'System Administrator'
    })
    expect(sut.id).toBeDefined()
    expect(sut.slug).toBe('admin')
    expect(sut.description).toBe('System Administrator')
    expect(sut.permissions).toEqual([])
  })

  test('Should add permission', () => {
    const sut = Role.create({ slug: 'admin' })
    const permission = Permission.create({ slug: 'users:read' })

    sut.addPermission(permission)

    expect(sut.permissions).toHaveLength(1)
    expect(sut.permissions[0].slug).toBe('users:read')
  })

  test('Should not add duplicate permission', () => {
    const sut = Role.create({ slug: 'admin' })
    const permission = Permission.create({ slug: 'users:read' })

    sut.addPermission(permission)
    sut.addPermission(permission)

    expect(sut.permissions).toHaveLength(1)
  })
})
