import { LoadCityByNameAndStateRepository, AddCityRepository } from '@/modules/geography/domain/gateways/city-gateway'
import { LoadCityByIdRepository } from '@/modules/geography/application/protocols/db/city/load-city-by-id-repository'
import { City } from '@/modules/geography/domain'
import { CityTypeOrmEntity } from '../entities/city'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'

export class CityTypeOrmRepository implements LoadCityByNameAndStateRepository, AddCityRepository, LoadCityByIdRepository {
  async loadByNameAndState(name: string, stateId: string): Promise<City | undefined> {
    const repo = await TypeOrmHelper.getRepository(CityTypeOrmEntity)
    const city = await repo.findOne({ where: { name, state_id: stateId } })
    return city ? this.toDomain(city) : undefined
  }

  async loadById(id: string): Promise<City | undefined> {
    const repo = await TypeOrmHelper.getRepository(CityTypeOrmEntity)
    const city = await repo.findOne({ where: { id } })
    return city ? this.toDomain(city) : undefined
  }

  async add(name: string, stateId: string): Promise<City> {
    const repo = await TypeOrmHelper.getRepository(CityTypeOrmEntity)
    const city = repo.create({
      name,
      state_id: stateId,
      createdAt: new Date()
    })
    const saved = await repo.save(city)
    return this.toDomain(saved)
  }

  private toDomain(entity: CityTypeOrmEntity): City {
    return City.restore({
      id: Id.restore(entity.id),
      name: entity.name,
      stateId: Id.restore(entity.state_id)
    })
  }
}
