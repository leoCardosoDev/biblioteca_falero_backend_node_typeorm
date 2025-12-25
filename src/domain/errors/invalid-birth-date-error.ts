import { DomainError } from './domain-error'

export class InvalidBirthDateError extends DomainError {
  constructor(date: string) {
    super(`The birth date "${date}" is invalid`)
  }
}
