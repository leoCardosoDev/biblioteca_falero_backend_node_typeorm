import { InvalidParamError } from '../errors/invalid-param-error'

export class State {
  private constructor(public readonly value: string) { }

  static create(name: string): State | Error {
    if (!name || !name.trim()) {
      return new InvalidParamError('name')
    }
    const normalized = name.trim().toUpperCase()
    return new State(normalized)
  }
}
