import { DomainError } from '@/shared/domain/errors'

export class InvalidStateError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidStateError'
  }
}
