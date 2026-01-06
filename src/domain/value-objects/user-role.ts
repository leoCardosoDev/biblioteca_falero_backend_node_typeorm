import { InvalidUserRoleError } from '@/domain/errors'

export type UserRoleTypes = 'ADMIN' | 'LIBRARIAN' | 'PROFESSOR' | 'STUDENT'

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
    const validRoles = ['ADMIN', 'LIBRARIAN', 'PROFESSOR', 'STUDENT']
    return validRoles.includes(role)
  }

  get powerLevel(): number {
    switch (this.role) {
      case 'ADMIN': return 100
      case 'LIBRARIAN': return 50
      case 'PROFESSOR': return 10
      default: return 0 // STUDENT
    }
  }
  static restore(role: string): UserRole {
    return new UserRole(role.toUpperCase() as UserRoleTypes)
  }
}
