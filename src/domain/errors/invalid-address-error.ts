export class InvalidAddressError extends Error {
  constructor(field: string) {
    super(`Invalid address: ${field}`)
    this.name = 'InvalidAddressError'
  }
}
