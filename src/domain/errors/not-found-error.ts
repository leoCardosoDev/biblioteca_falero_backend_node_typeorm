import { DomainError } from './domain-error'

export class NotFoundError extends DomainError {
  constructor(resourceName: string) {
    super(`${resourceName} not found`)
  }
}
