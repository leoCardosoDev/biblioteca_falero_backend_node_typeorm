import { DomainError } from './domain-error'

export class InvalidUserStatusError extends DomainError {
  constructor() {
    super('Invalid User Status')
  }
}
