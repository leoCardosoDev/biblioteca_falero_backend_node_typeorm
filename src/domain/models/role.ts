export enum Role {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  MEMBER = 'MEMBER'
}

export type TokenPayload = {
  id: string
  role: Role
}
