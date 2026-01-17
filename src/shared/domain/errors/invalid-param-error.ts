import { DomainError } from './domain-error'

export class InvalidParamError extends Error implements DomainError {
  constructor(paramName: string) {
    super(`Invalid param: ${paramName}`)
    this.name = 'InvalidParamError'
  }
}
