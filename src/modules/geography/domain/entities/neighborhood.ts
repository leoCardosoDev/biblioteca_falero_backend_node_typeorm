import { Either, left, right } from '@/shared/application/either'
import { Id } from '@/shared/domain/value-objects/id'
import { InvalidNeighborhoodError } from '@/modules/geography/domain/errors'

export interface NeighborhoodProps {
  id: Id
  name: string
  cityId: Id
}

export class Neighborhood {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly cityId: Id
  ) { }

  static create(props: NeighborhoodProps): Either<InvalidNeighborhoodError, Neighborhood> {
    if (!props.name || !props.name.trim()) {
      return left(new InvalidNeighborhoodError('Neighborhood name is required'))
    }
    return right(new Neighborhood(props.id, props.name.trim(), props.cityId))
  }

  static restore(props: NeighborhoodProps): Neighborhood {
    return new Neighborhood(props.id, props.name, props.cityId)
  }
}
