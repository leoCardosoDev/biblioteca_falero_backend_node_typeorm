import { DomainError } from '@/shared/domain/errors'

export class InvalidNeighborhoodError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidNeighborhoodError'
  }
}
