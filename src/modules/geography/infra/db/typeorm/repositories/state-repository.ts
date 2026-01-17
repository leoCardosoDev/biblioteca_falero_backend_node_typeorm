import { LoadStateByUfRepository } from '@/modules/geography/domain/gateways/state-gateway'
import { LoadStateByIdRepository } from '@/modules/geography/application/protocols/db/state/load-state-by-id-repository'
import { StateModel } from '@/modules/geography/domain/models/state'
import { StateTypeOrmEntity } from '../entities/state'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'

export class StateTypeOrmRepository implements LoadStateByUfRepository, LoadStateByIdRepository {
  async loadByUf(uf: string): Promise<StateModel | null> {
    const repo = await TypeOrmHelper.getRepository(StateTypeOrmEntity)
    const state = await repo.findOne({ where: { uf } })
    return state ? this.toDomain(state) : null
  }

  async loadById(id: string): Promise<StateModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(StateTypeOrmEntity)
    const state = await repo.findOne({ where: { id } })
    return state ? this.toDomain(state) : undefined
  }

  private toDomain(entity: StateTypeOrmEntity): StateModel {
    return {
      id: Id.restore(entity.id),
      name: entity.name,
      uf: entity.uf
    }
  }
}
