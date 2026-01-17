
import { DbManageUserAccess } from '@/modules/identity/application/usecases/db-manage-user-access'
import { ManageUserAccess } from '@/modules/identity/application/usecases/manage-user-access'
import { LoginTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/login-repository'
import { RoleRepository } from '@/modules/identity/infra/db/typeorm/repositories/role-repository'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'
import { BcryptAdapter } from '@/shared/infra/cryptography/bcrypt-adapter'

export const makeManageUserAccess = (): ManageUserAccess => {
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const loginRepository = new LoginTypeOrmRepository()
  const roleRepository = new RoleRepository()
  const userRepository = new UserTypeOrmRepository()
  return new DbManageUserAccess(
    loginRepository,       // loadLoginByUserId
    roleRepository,        // loadRoleById
    roleRepository,        // loadRoleBySlug
    userRepository,        // loadUserById
    loginRepository,       // updateLoginPassword
    loginRepository,       // updateLoginRole
    userRepository,        // updateUserStatus
    loginRepository,       // updateLoginStatus
    loginRepository,       // addLoginRepository
    bcryptAdapter,         // hasher
    bcryptAdapter          // hashComparer
  )
}
