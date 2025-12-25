import { DomainError } from './domain-error'

export class EmailInUseError extends DomainError {
  constructor() {
    super('The received email is already in use')
  }
}
