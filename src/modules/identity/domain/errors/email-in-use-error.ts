import { DomainError } from '@/shared/domain/errors/domain-error'

export class EmailInUseError extends DomainError {
  constructor() {
    super('The received email is already in use')
  }
}
