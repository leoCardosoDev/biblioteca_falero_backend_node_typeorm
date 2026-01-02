import { Permission } from '@/domain/models/permission'

describe('Permission Entity', () => {
  test('Should create a valid Permission', () => {
    const sut = Permission.create({
      slug: 'users:read',
      description: 'Allows reading users'
    })
    expect(sut.id).toBeDefined()
    expect(sut.slug).toBe('users:read')
    expect(sut.description).toBe('Allows reading users')
  })

  test('Should update description', () => {
    const sut = Permission.create({
      slug: 'users:read',
      description: 'Old description'
    })
    sut.updateDescription('New description')
    expect(sut.description).toBe('New description')
  })
})
