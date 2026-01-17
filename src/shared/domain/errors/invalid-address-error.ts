import { DomainError } from '@/shared/domain/errors/domain-error'

export class InvalidAddressError extends Error implements DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAddressError'
  }
}
