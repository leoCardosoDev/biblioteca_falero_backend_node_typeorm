import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'

describe('UserTypeOrmEntity', () => {
  it('should be defined', () => {
    expect(new UserTypeOrmEntity()).toBeDefined()
  })
})
