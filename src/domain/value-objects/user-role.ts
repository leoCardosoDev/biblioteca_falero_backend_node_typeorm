import { InvalidUserRoleError } from '../errors'

export type UserRoleTypes = 'ADMIN' | 'LIBRARIAN' | 'MEMBER'

export class UserRole {
  private readonly role: UserRoleTypes

  private constructor(role: UserRoleTypes) {
    this.role = role
  }

  get value(): UserRoleTypes {
    return this.role
  }

  static create(role: string): UserRole | Error {
    const normalizedRole = role.toUpperCase()
    if (!UserRole.validate(normalizedRole)) {
      return new InvalidUserRoleError()
    }
    return new UserRole(normalizedRole as UserRoleTypes)
  }

  private static validate(role: string): boolean {
    const validRoles = ['ADMIN', 'LIBRARIAN', 'MEMBER']
    return validRoles.includes(role)
  }
}
