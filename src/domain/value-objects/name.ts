import { InvalidNameError } from '@/domain/errors/invalid-name-error'

export class Name {
  private readonly name: string

  private constructor(name: string) {
    this.name = name
  }

  get value(): string {
    return this.name
  }

  static create(name: string): Name | InvalidNameError {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) {
      return new InvalidNameError(name)
    }
    return new Name(trimmed)
  }
  static restore(name: string): Name {
    return new Name(name)
  }
}
