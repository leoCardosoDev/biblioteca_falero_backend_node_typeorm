import { LoadCityByNameAndStateRepository, AddCityRepository } from '@/modules/geography/domain/gateways/city-gateway'
import { LoadCityByIdRepository } from '@/modules/geography/application/protocols/db/city/load-city-by-id-repository'
import { CityModel } from '@/modules/geography/domain/models/city'
import { CityTypeOrmEntity } from '../entities/city'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'

export class CityTypeOrmRepository implements LoadCityByNameAndStateRepository, AddCityRepository, LoadCityByIdRepository {
  async loadByNameAndState(name: string, stateId: string): Promise<CityModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(CityTypeOrmEntity)
    const city = await repo.findOne({ where: { name, state_id: stateId } })
    return city ? this.toDomain(city) : undefined
  }

  async loadById(id: string): Promise<CityModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(CityTypeOrmEntity)
    const city = await repo.findOne({ where: { id } })
    return city ? this.toDomain(city) : undefined
  }

  async add(name: string, stateId: string): Promise<CityModel> {
    const repo = await TypeOrmHelper.getRepository(CityTypeOrmEntity)
    const city = repo.create({
      name,
      state_id: stateId,
      createdAt: new Date()
    })
    const saved = await repo.save(city)
    return this.toDomain(saved)
  }

  private toDomain(entity: CityTypeOrmEntity): CityModel {
    return {
      id: Id.create(entity.id) as Id,
      name: entity.name,
      stateId: Id.create(entity.state_id) as Id
    }
  }
}
