import { InvalidParamError } from '@/presentation/errors/invalid-param-error'

export class Neighborhood {
  private constructor(public readonly value: string) { }

  static create(name: string): Neighborhood | Error {
    if (!name || !name.trim()) {
      return new InvalidParamError('name')
    }
    const normalized = name.trim().toUpperCase()
    return new Neighborhood(normalized)
  }
}
