import { DomainError } from './domain-error'

export class InvalidUserRoleError extends DomainError {
  constructor() {
    super('Invalid User Role')
  }
}
