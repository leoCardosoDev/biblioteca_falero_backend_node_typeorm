export class InvalidRgError extends Error {
  constructor(rg: string) {
    super(`The RG "${rg}" is invalid`)
    this.name = 'InvalidRgError'
  }
}
