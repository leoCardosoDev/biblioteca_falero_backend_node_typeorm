import { DomainError } from './domain-error'

export class InvalidPasswordError extends DomainError {
  constructor(message: string) {
    super(message)
  }
}
