export class InvalidCpfError extends Error {
  constructor() {
    super('Invalid CPF')
    this.name = 'InvalidCpfError'
  }
}
