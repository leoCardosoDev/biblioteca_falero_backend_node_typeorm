import { AppError } from '@/application/errors/app-error'

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED_ACCESS', 'Unauthorized')
  }
}
