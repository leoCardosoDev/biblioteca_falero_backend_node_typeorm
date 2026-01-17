import { AuthMiddleware } from '@/modules/identity/presentation/middlewares/auth-middleware'
import { Middleware } from '@/shared/presentation/protocols'
import { makeJwtAdapter } from './../../factories/usecases/jwt-adapter-factory'

export const makeAuthMiddleware = (): Middleware => {
  const jwtAdapter = makeJwtAdapter()
  return new AuthMiddleware(jwtAdapter)
}
