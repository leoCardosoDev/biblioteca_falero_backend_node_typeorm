import { AppError } from '@/application/errors/app-error'

export class AccessDeniedError extends AppError {
  constructor() {
    super('ACCESS_DENIED', 'Access denied')
  }
}
