import { LoadStateByUfRepository } from '@/application/protocols/db/state/load-state-by-uf-repository'
import { StateModel } from '@/domain/models/state'
import { State } from './entities/state'
import { TypeOrmHelper } from './typeorm-helper'
import { Id } from '@/domain/value-objects/id'

export class StateTypeOrmRepository implements LoadStateByUfRepository {
  async loadByUf(uf: string): Promise<StateModel> {
    const repo = await TypeOrmHelper.getRepository(State)
    const state = await repo.findOne({ where: { uf } })
    return state ? this.toDomain(state) : null
  }

  private toDomain(entity: State): StateModel {
    return {
      id: Id.create(entity.id) as Id,
      name: entity.name,
      uf: entity.uf
    }
  }
}
