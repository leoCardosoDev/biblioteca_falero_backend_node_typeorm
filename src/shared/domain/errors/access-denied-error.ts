import { AppError } from './app-error'
import { DomainError } from './domain-error'

export class AccessDeniedError extends AppError implements DomainError {
  public readonly type = 'SECURITY'

  constructor() {
    super('Access denied', 'ACCESS_DENIED')
    this.name = 'AccessDeniedError'
  }
}
