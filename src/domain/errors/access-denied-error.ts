
import { DomainError } from './domain-error'

export class AccessDeniedError extends Error implements DomainError {
  constructor() {
    super('Access denied')
    this.name = 'AccessDeniedError'
  }
}
