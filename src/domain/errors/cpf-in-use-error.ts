import { DomainError } from './domain-error'

export class CpfInUseError extends DomainError {
  constructor() {
    super('The received CPF is already in use')
  }
}
