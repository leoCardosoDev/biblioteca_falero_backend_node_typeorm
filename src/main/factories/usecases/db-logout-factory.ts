import { Logout } from '@/modules/identity/application/usecases/logout'
import { DbLogout } from '@/modules/identity/application/usecases/db-logout'
import { SessionTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/session-repository'
import { Sha256Adapter } from '@/shared/infra/cryptography/sha256-adapter'

export const makeDbLogout = (): Logout => {
  const sha256Adapter = new Sha256Adapter()
  const sessionRepository = new SessionTypeOrmRepository()
  return new DbLogout(sha256Adapter, sessionRepository, sessionRepository)
}
