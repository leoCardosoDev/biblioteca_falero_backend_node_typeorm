import { DbManageUserAccess } from '@/application/usecases/db-manage-user-access'
import { LoginTypeOrmRepository } from '@/infra/db/typeorm/login-repository'
import { RoleRepository } from '@/infra/db/typeorm/role-repository'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'

export const makeDbManageUserAccess = (): DbManageUserAccess => {
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  const userRepository = new UserTypeOrmRepository()
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)

  return new DbManageUserAccess(
    loginRepository,
    roleRepository,
    roleRepository,
    loginRepository,
    userRepository,
    loginRepository,
    loginRepository,
    bcryptAdapter
  )
}
