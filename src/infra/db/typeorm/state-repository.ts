import { LoadStateByUfRepository } from '@/application/protocols/db/state/load-state-by-uf-repository'
import { LoadStateByIdRepository } from '@/application/protocols/db/state/load-state-by-id-repository'
import { StateModel } from '@/domain/models/state'
import { State } from './entities/state'
import { TypeOrmHelper } from './typeorm-helper'
import { Id } from '@/domain/value-objects/id'

export class StateTypeOrmRepository implements LoadStateByUfRepository, LoadStateByIdRepository {
  async loadByUf(uf: string): Promise<StateModel | null> {
    const repo = await TypeOrmHelper.getRepository(State)
    const state = await repo.findOne({ where: { uf } })
    return state ? this.toDomain(state) : null
  }

  async loadById(id: string): Promise<StateModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(State)
    const state = await repo.findOne({ where: { id } })
    return state ? this.toDomain(state) : undefined
  }

  private toDomain(entity: State): StateModel {
    return {
      id: Id.restore(entity.id),
      name: entity.name,
      uf: entity.uf
    }
  }
}
