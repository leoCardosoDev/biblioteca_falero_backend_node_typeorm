import { DomainError } from '@/shared/domain/errors/domain-error'

export class InvalidCpfError extends DomainError {
  constructor() {
    super('Invalid CPF')
  }
}
