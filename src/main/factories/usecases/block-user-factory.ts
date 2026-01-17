
import { DbBlockUser } from '@/modules/identity/application/usecases/db-block-user'
import { BlockUser } from '@/modules/identity/application/usecases/block-user'
import { LoginTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/login-repository'
import { RoleRepository } from '@/modules/identity/infra/db/typeorm/repositories/role-repository'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'

export const makeBlockUser = (): BlockUser => {
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  const userRepository = new UserTypeOrmRepository()
  return new DbBlockUser(loginRepository, roleRepository, userRepository)
}
