
import { DbBlockUser } from '@/application/usecases/db-block-user'
import { BlockUser } from '@/domain/usecases/block-user'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { RoleTypeOrmRepository } from '@/infra/db/typeorm/role-repository'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'

export const makeBlockUser = (): BlockUser => {
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleTypeOrmRepository()
  const userRepository = new UserTypeOrmRepository()
  return new DbBlockUser(loginRepository, roleRepository, userRepository)
}
