import { AppError } from '@/application/errors/app-error'

export class ServerError extends AppError {
  constructor(stack?: string) {
    super('INTERNAL_ERROR', 'Internal server error')
    if (stack) {
      this.stack = stack
    }
  }
}
