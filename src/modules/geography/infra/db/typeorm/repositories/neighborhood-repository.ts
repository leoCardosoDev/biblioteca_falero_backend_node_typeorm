import { AddNeighborhoodRepository, LoadNeighborhoodByNameAndCityRepository } from '@/modules/geography/domain/gateways/neighborhood-gateway'
import { LoadNeighborhoodByIdRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'
import { NeighborhoodModel } from '@/modules/geography/domain/models/neighborhood'
import { NeighborhoodTypeOrmEntity } from '../entities/neighborhood'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'

export class NeighborhoodTypeOrmRepository implements AddNeighborhoodRepository, LoadNeighborhoodByNameAndCityRepository, LoadNeighborhoodByIdRepository {
  async findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(NeighborhoodTypeOrmEntity)
    const neighborhood = await repo.findOne({ where: { name, city_id: cityId } })
    return neighborhood ? this.toDomain(neighborhood) : undefined
  }

  async loadByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
    return this.findByNameAndCity(name, cityId)
  }

  async loadById(id: string): Promise<NeighborhoodModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(NeighborhoodTypeOrmEntity)
    const neighborhood = await repo.findOne({ where: { id } })
    return neighborhood ? this.toDomain(neighborhood) : undefined
  }

  async add(name: string, cityId: string): Promise<NeighborhoodModel> {
    const repo = await TypeOrmHelper.getRepository(NeighborhoodTypeOrmEntity)
    const neighborhood = repo.create({
      name,
      city_id: cityId,
      createdAt: new Date()
    })
    const saved = await repo.save(neighborhood)
    return this.toDomain(saved)
  }

  private toDomain(entity: NeighborhoodTypeOrmEntity): NeighborhoodModel {
    return {
      id: Id.create(entity.id) as Id,
      name: entity.name,
      cityId: Id.create(entity.city_id) as Id
    }
  }
}
