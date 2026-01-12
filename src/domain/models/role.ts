import { Id } from '@/domain/value-objects'
import { Permission } from './permission'

export type RoleProps = {
  id?: Id
  slug: string
  description?: string
  permissions?: Permission[]
  powerLevel?: number
}

export class Role {
  private constructor(
    public readonly id: Id,
    public readonly slug: string,
    private _description: string,
    private _permissions: Permission[],
    private _powerLevel: number
  ) { }

  static create(props: RoleProps): Role {
    if (!props.id) throw new Error('ID is required')
    return new Role(
      props.id!,
      props.slug,
      props.description ?? '',
      props.permissions ?? [],
      props.powerLevel ?? 0
    )
  }

  get description(): string {
    return this._description
  }

  get permissions(): Permission[] {
    return this._permissions
  }

  get powerLevel(): number {
    return this._powerLevel
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
