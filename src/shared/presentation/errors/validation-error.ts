export class ValidationError extends Error {
  public readonly details: string[]

  constructor(details: string[]) {
    super('Validation Error')
    this.name = 'ValidationError'
    this.details = details
  }
}
