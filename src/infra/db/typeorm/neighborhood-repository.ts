import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Neighborhood } from './entities/neighborhood'
import { TypeOrmHelper } from './typeorm-helper'
import { Id } from '@/domain/value-objects/id'

export class NeighborhoodTypeOrmRepository implements AddNeighborhoodRepository {
  async findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(Neighborhood)
    const neighborhood = await repo.findOne({ where: { name, city_id: cityId } })
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
