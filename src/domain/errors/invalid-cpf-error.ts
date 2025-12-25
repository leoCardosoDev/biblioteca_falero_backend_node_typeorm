import { DomainError } from './domain-error'

export class InvalidCpfError extends DomainError {
  constructor() {
    super('Invalid CPF')
  }
}
