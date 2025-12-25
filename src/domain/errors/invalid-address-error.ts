import { DomainError } from './domain-error'

export class InvalidAddressError extends DomainError {
  constructor(field: string) {
    super(`Invalid address: ${field}`)
  }
}
