import { Either, left, right } from '@/shared/application/either'
import { Id } from '@/shared/domain/value-objects/id'
import { InvalidCityError } from '@/modules/geography/domain/errors'

export interface CityProps {
  id: Id
  name: string
  stateId: Id
}

export class City {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly stateId: Id
  ) { }

  static create(props: CityProps): Either<InvalidCityError, City> {
    if (!props.name || !props.name.trim()) {
      return left(new InvalidCityError('City name is required'))
    }
    return right(new City(props.id, props.name.trim(), props.stateId))
  }

  static restore(props: CityProps): City {
    return new City(props.id, props.name, props.stateId)
  }
}
