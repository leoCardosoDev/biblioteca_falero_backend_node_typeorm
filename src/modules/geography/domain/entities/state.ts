import { Either, left, right } from '@/shared/application/either'
import { Id } from '@/shared/domain/value-objects/id'
import { InvalidStateError } from '@/modules/geography/domain/errors'

const UF_LENGTH = 2

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

  static create(props: StateProps): Either<InvalidStateError, State> {
    if (!props.name || !props.name.trim()) {
      return left(new InvalidStateError('State name is required'))
    }
    if (!props.uf || props.uf.trim().length !== UF_LENGTH) {
      return left(new InvalidStateError('State UF must be exactly 2 characters'))
    }
    return right(new State(props.id, props.name.trim(), props.uf.trim().toUpperCase()))
  }

  static restore(props: StateProps): State {
    return new State(props.id, props.name, props.uf)
  }
}
