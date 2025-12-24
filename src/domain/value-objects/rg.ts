import { InvalidRgError } from '@/domain/errors/invalid-rg-error'

export class Rg {
  private readonly rg: string

  private constructor(rg: string) {
    this.rg = rg
  }

  get value(): string {
    return this.rg
  }

  static create(rg: string): Rg | InvalidRgError {
    const cleaned = rg.replace(/[.\-\s]/g, '')
    if (!cleaned) {
      return new InvalidRgError(rg)
    }
    if (!/^[a-zA-Z0-9]+$/.test(cleaned)) {
      return new InvalidRgError(rg)
    }
    return new Rg(cleaned)
  }
}
