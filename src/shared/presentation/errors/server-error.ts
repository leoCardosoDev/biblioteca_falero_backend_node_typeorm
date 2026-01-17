import { DomainError } from '@/shared/domain/errors/domain-error'

export class ServerError extends Error implements DomainError {
  public code: string
  constructor(stack: string) {
    super('Internal server error')
    this.name = 'ServerError'
    this.code = 'INTERNAL_ERROR'
    this.stack = stack
  }
}
