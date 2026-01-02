
import { DbPromoteUser } from '@/application/usecases/db-promote-user'
import { PromoteUser } from '@/domain/usecases/promote-user'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { RoleTypeOrmRepository } from '@/infra/db/typeorm/role-repository'

export const makePromoteUser = (): PromoteUser => {
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleTypeOrmRepository()
  return new DbPromoteUser(loginRepository, roleRepository, loginRepository)
}
