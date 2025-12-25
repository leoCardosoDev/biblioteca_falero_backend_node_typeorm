import { DomainError } from './domain-error'

export class InvalidRgError extends DomainError {
  constructor(rg: string) {
    super(`The RG "${rg}" is invalid`)
  }
}
