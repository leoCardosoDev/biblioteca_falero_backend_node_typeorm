import { DomainError } from '@/shared/domain/errors'

export class InvalidCityError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCityError'
  }
}
