import { AppError } from './app-error'

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED_ACCESS', 'Unauthorized')
  }
}
