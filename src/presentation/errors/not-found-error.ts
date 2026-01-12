import { AppError } from '@/application/errors/app-error'
export class NotFoundError extends AppError {
  constructor(paramName: string) {
    super('NOT_FOUND', `${paramName} not found`)
    this.name = 'NotFoundError'
  }
}
