import { DomainError } from './domain-error'

export class InvalidIdError extends DomainError {
  constructor() {
    super('Invalid ID format')
  }
}
