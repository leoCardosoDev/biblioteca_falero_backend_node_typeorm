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
    return new Permission(
      props.id ?? Id.generate(),
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
