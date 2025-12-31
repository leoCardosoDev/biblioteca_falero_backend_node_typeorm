import { InvalidUserStatusError } from '../errors'

export type UserStatusTypes = 'active' | 'inactive'

export class UserStatus {
  private readonly status: UserStatusTypes

  private constructor(status: UserStatusTypes) {
    this.status = status
  }

  get value(): UserStatusTypes {
    return this.status
  }

  static create(status: string): UserStatus | Error {
    const normalizedStatus = status.toLowerCase()
    if (!UserStatus.validate(normalizedStatus)) {
      return new InvalidUserStatusError()
    }
    return new UserStatus(normalizedStatus as UserStatusTypes)
  }

  private static validate(status: string): boolean {
    const validStatuses = ['active', 'inactive']
    return validStatuses.includes(status)
  }
}
