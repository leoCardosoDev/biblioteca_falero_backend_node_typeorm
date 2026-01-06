import { randomUUID } from 'crypto'

import { InvalidIdError } from '@/domain/errors/invalid-id-error'

export class Id {
  private readonly id: string

  private constructor(id: string) {
    this.id = id
  }

  get value(): string {
    return this.id
  }

  static create(id: string): Id {
    if (!id || !Id.isValid(id)) {
      throw new InvalidIdError()
    }
    return new Id(id)
  }

  static generate(): Id {
    return new Id(randomUUID())
  }

  private static isValid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  }
  static restore(id: string): Id {
    return new Id(id)
  }
}
