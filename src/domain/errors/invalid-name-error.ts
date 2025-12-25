import { DomainError } from './domain-error'

export class InvalidNameError extends DomainError {
  constructor(name: string) {
    super(`The name "${name}" is invalid`)
  }
}
