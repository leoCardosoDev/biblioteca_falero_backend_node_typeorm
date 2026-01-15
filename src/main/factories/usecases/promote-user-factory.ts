
import { DbPromoteUser } from '@/application/usecases/db-promote-user'
import { PromoteUser } from '@/domain/usecases/promote-user'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { RoleRepository } from '@/infra/db/typeorm/role-repository'

export const makePromoteUser = (): PromoteUser => {
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  return new DbPromoteUser(loginRepository, roleRepository, loginRepository)
}
