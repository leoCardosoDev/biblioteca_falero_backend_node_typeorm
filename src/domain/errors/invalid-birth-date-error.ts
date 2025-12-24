export class InvalidBirthDateError extends Error {
  constructor(date: string) {
    super(`The birth date "${date}" is invalid`)
    this.name = 'InvalidBirthDateError'
  }
}
