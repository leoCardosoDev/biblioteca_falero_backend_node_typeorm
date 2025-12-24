export class InvalidIdError extends Error {
  constructor() {
    super('Invalid ID format')
    this.name = 'InvalidIdError'
  }
}
