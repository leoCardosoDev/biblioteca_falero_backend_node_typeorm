import { Logout } from '@/domain/usecases/logout'
import { DbLogout } from '@/application/usecases/db-logout'
import { SessionTypeOrmRepository } from '@/infra/db/typeorm/session-repository'
import { Sha256Adapter } from '@/infra/cryptography/sha256-adapter'

export const makeDbLogout = (): Logout => {
  const sha256Adapter = new Sha256Adapter()
  const sessionRepository = new SessionTypeOrmRepository()
  return new DbLogout(sha256Adapter, sessionRepository, sessionRepository)
}
