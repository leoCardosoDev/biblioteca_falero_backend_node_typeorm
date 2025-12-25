import { AppError } from './app-error'

export class AccessDeniedError extends AppError {
  constructor() {
    super('FORBIDDEN', 'Access denied')
  }
}
