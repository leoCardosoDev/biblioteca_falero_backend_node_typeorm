import { DomainError } from '@/shared/domain/errors/domain-error'

export class InvalidUserStatusError extends DomainError {
  constructor() {
    super('Invalid User Status')
  }
}
