import { DomainError } from './domain-error'

export class InvalidAddressError extends DomainError {
  constructor(message: string) {
    super(message)
  }
}
