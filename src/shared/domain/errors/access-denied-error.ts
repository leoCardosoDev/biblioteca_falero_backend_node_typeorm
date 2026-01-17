import { AppError } from './app-error'

export class AccessDeniedError extends AppError {
  public readonly type = 'SECURITY'

  constructor() {
    super('Access denied', 'ACCESS_DENIED')
    this.name = 'AccessDeniedError'
  }
}
