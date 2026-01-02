import { AppError } from './app-error'

export class AccessDeniedError extends AppError {
  constructor() {
    super('ACCESS_DENIED', 'Access denied')
  }
}
