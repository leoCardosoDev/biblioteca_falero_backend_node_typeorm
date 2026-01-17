
import { DbPromoteUser } from '@/modules/identity/application/usecases/db-promote-user'
import { PromoteUser } from '@/modules/identity/application/usecases/promote-user'
import { LoginTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/login-repository'
import { RoleRepository } from '@/modules/identity/infra/db/typeorm/repositories/role-repository'

export const makePromoteUser = (): PromoteUser => {
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  return new DbPromoteUser(loginRepository, roleRepository, loginRepository)
}
