import { AppError } from './app-error'

export class ValidationError extends AppError {
  constructor(details?: unknown) {
    super('VALIDATION_ERROR', 'Validation failed', details)
    this.name = 'ValidationError'
  }
}
