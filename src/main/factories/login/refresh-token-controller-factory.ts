import { RefreshTokenController } from '@/presentation/controllers/login/refresh-token-controller'
import { Controller } from '@/presentation/protocols/controller'
import { makeRefreshTokenValidation } from './refresh-token-validation-factory'
import { makeDbRefreshToken } from '@/main/factories/usecases/db-refresh-token-factory'

export const makeRefreshTokenController = (): Controller => {
  return new RefreshTokenController(makeDbRefreshToken(), makeRefreshTokenValidation())
}
