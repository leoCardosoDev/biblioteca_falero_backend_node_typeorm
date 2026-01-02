import { Id } from '@/domain/value-objects/id'
import { Permission } from '@/domain/models/permission'

export type RoleProps = {
  id?: Id
  slug: string
  description?: string
  permissions?: Permission[]
}

export class Role {
  private constructor(
    public readonly id: Id,
    public readonly slug: string,
    private _description: string,
    private _permissions: Permission[]
  ) { }

  static create(props: RoleProps): Role {
    return new Role(
      props.id ?? Id.generate(),
      props.slug,
      props.description ?? '',
      props.permissions ?? []
    )
  }

  get description(): string {
    return this._description
  }

  get permissions(): Permission[] {
    return this._permissions
  }

  addPermission(permission: Permission): void {
    if (!this.hasPermission(permission)) {
      this._permissions.push(permission)
    }
  }

  private hasPermission(permission: Permission): boolean {
    return this._permissions.some(p => p.slug === permission.slug)
  }
}
