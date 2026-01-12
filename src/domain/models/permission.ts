import { Id } from '@/domain/value-objects/id'

export type PermissionProps = {
  id?: Id
  slug: string
  description?: string
}

export class Permission {
  private constructor(
    public readonly id: Id,
    public readonly slug: string,
    private _description: string
  ) { }

  static create(props: PermissionProps): Permission {
    if (!props.id) throw new Error('ID is required')
    return new Permission(
      props.id!,
      props.slug,
      props.description ?? ''
    )
  }

  get description(): string {
    return this._description
  }

  updateDescription(description: string): void {
    this._description = description
  }
}
