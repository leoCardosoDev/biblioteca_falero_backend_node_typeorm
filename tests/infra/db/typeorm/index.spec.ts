
import * as Repositories from '@/infra/db/typeorm'

describe('Infra Data Source Index Exports', () => {
  test('Should export all repositories', () => {
    expect(Repositories.UserTypeOrmRepository).toBeDefined()
    expect(Repositories.RoleTypeOrmRepository).toBeDefined()
    expect(Repositories.LoginTypeOrmRepository).toBeDefined()
    expect(Repositories.SessionTypeOrmRepository).toBeDefined()
    expect(Repositories.NeighborhoodTypeOrmRepository).toBeDefined()
    expect(Repositories.DomainEventTypeOrmRepository).toBeDefined()
  })
})
