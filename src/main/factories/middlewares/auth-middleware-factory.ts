import { AuthMiddleware } from '@/presentation/middlewares/auth-middleware'
import { Middleware } from '@/presentation/protocols'
import { makeJwtAdapter } from './../../factories/usecases/jwt-adapter-factory'

export const makeAuthMiddleware = (): Middleware => {
  const jwtAdapter = makeJwtAdapter()
  return new AuthMiddleware(jwtAdapter)
}
