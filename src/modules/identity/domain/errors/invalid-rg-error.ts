import { DomainError } from '@/shared/domain/errors/domain-error'

export class InvalidRgError extends DomainError {
  constructor(rg: string) {
    super(`The RG "${rg}" is invalid`)
  }
}
