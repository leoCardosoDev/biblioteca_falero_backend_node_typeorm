import { InvalidParamError } from '@/presentation/errors/invalid-param-error'

export class City {
  private constructor(public readonly value: string) { }

  static create(name: string): City | Error {
    if (!name || !name.trim()) {
      return new InvalidParamError('name')
    }
    const normalized = name.trim().toUpperCase()
    return new City(normalized)
  }
}
