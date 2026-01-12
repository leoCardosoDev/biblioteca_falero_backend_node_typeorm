import { AddNeighborhoodRepository } from '@/domain/gateways/neighborhood-gateway'
import { LoadNeighborhoodByNameAndCityRepository } from '@/domain/gateways/neighborhood-gateway'
import { LoadNeighborhoodByIdRepository } from '@/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Neighborhood } from './entities/neighborhood'
import { TypeOrmHelper } from './typeorm-helper'
import { Id } from '@/domain/value-objects/id'

export class NeighborhoodTypeOrmRepository implements AddNeighborhoodRepository, LoadNeighborhoodByNameAndCityRepository, LoadNeighborhoodByIdRepository {
  async findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(Neighborhood)
    const neighborhood = await repo.findOne({ where: { name, city_id: cityId } })
    return neighborhood ? this.toDomain(neighborhood) : undefined
  }

  async loadByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
    return this.findByNameAndCity(name, cityId)
  }

  async loadById(id: string): Promise<NeighborhoodModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(Neighborhood)
    const neighborhood = await repo.findOne({ where: { id } })
    return neighborhood ? this.toDomain(neighborhood) : undefined
  }

  async add(name: string, cityId: string): Promise<NeighborhoodModel> {
    const repo = await TypeOrmHelper.getRepository(Neighborhood)
    const neighborhood = repo.create({
      name,
      city_id: cityId,
      createdAt: new Date()
    })
    const saved = await repo.save(neighborhood)
    return this.toDomain(saved)
  }

  private toDomain(entity: Neighborhood): NeighborhoodModel {
    return {
      id: Id.create(entity.id) as Id,
      name: entity.name,
      cityId: Id.create(entity.city_id) as Id
    }
  }
}
