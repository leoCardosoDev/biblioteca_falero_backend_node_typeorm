import { Id } from '@/shared/domain/value-objects/id'

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

  static create(props: CityProps): City {
    return new City(props.id, props.name, props.stateId)
  }

  static restore(props: CityProps): City {
    return new City(props.id, props.name, props.stateId)
  }
}
