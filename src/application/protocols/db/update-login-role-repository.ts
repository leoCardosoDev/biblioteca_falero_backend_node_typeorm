
export interface UpdateLoginRoleRepository {
  updateRole: (userId: string, roleId: string) => Promise<void>
}
