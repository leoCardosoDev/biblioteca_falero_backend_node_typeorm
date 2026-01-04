import { InvalidUserStatusError } from '@/domain/errors'

export enum UserStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export type UserStatusTypes = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export class UserStatus {
  private readonly status: UserStatusTypes

  private constructor(status: UserStatusTypes) {
    this.status = status
  }

  get value(): UserStatusTypes {
    return this.status
  }

  static create(status: string): UserStatus | Error {
    const normalizedStatus = status.toUpperCase()
    if (!UserStatus.validate(normalizedStatus)) {
      return new InvalidUserStatusError()
    }
    return new UserStatus(normalizedStatus as UserStatusTypes)
  }

  static validate(status: string): boolean {
    return Object.values(UserStatusEnum).includes(status as UserStatusEnum)
  }
}
