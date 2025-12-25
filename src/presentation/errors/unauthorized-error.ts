import { AppError } from './app-error'

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 'Unauthorized')
  }
}
