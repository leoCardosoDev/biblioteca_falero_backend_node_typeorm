import { InvalidIdError } from '@/shared/domain/errors/invalid-id-error'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  private static isValid(id: string): boolean {
    return UUID_REGEX.test(id)
  }
  static restore(id: string): Id {
    return new Id(id)
  }

  toJSON(): string {
    return this.id
  }

  toString(): string {
    return this.id
  }
}
