import { RefreshTokenController } from '@/modules/identity/presentation/controllers/refresh-token-controller'
import { Controller } from '@/shared/presentation/protocols/controller'
import { makeRefreshTokenValidation } from './refresh-token-validation-factory'
import { makeDbRefreshToken } from '@/main/factories/usecases/db-refresh-token-factory'

export const makeRefreshTokenController = (): Controller => {
  return new RefreshTokenController(makeDbRefreshToken(), makeRefreshTokenValidation())
}
