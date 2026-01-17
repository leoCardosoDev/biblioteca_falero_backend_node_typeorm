import { Id } from '@/shared/domain/value-objects/id'

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

  static create(props: NeighborhoodProps): Neighborhood {
    return new Neighborhood(props.id, props.name, props.cityId)
  }

  static restore(props: NeighborhoodProps): Neighborhood {
    return new Neighborhood(props.id, props.name, props.cityId)
  }
}
