import { Id } from '@/shared/domain/value-objects/id'

export interface StateProps {
  id: Id
  name: string
  uf: string
}

export class State {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly uf: string
  ) { }

  static create(props: StateProps): State {
    return new State(props.id, props.name, props.uf)
  }

  static restore(props: StateProps): State {
    return new State(props.id, props.name, props.uf)
  }
}
