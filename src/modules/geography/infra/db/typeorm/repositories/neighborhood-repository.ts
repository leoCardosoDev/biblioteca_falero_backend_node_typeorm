import { AddNeighborhoodRepository, LoadNeighborhoodByNameAndCityRepository } from '@/modules/geography/domain/gateways/neighborhood-gateway'
import { LoadNeighborhoodByIdRepository } from '@/modules/geography/application/protocols/db/neighborhood/load-neighborhood-by-id-repository'
import { Neighborhood } from '@/modules/geography/domain'
import { NeighborhoodTypeOrmEntity } from '../entities/neighborhood'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { Id } from '@/shared/domain/value-objects/id'

export class NeighborhoodTypeOrmRepository implements AddNeighborhoodRepository, LoadNeighborhoodByNameAndCityRepository, LoadNeighborhoodByIdRepository {
  async findByNameAndCity(name: string, cityId: string): Promise<Neighborhood | undefined> {
    const repo = await TypeOrmHelper.getRepository(NeighborhoodTypeOrmEntity)
    const neighborhood = await repo.findOne({ where: { name, city_id: cityId } })
    return neighborhood ? this.toDomain(neighborhood) : undefined
  }

  async loadByNameAndCity(name: string, cityId: string): Promise<Neighborhood | undefined> {
    return this.findByNameAndCity(name, cityId)
  }

  async loadById(id: string): Promise<Neighborhood | undefined> {
    const repo = await TypeOrmHelper.getRepository(NeighborhoodTypeOrmEntity)
    const neighborhood = await repo.findOne({ where: { id } })
    return neighborhood ? this.toDomain(neighborhood) : undefined
  }

  async add(name: string, cityId: string): Promise<Neighborhood> {
    const repo = await TypeOrmHelper.getRepository(NeighborhoodTypeOrmEntity)
    const neighborhood = repo.create({
      name,
      city_id: cityId,
      createdAt: new Date()
    })
    const saved = await repo.save(neighborhood)
    return this.toDomain(saved)
  }

  private toDomain(entity: NeighborhoodTypeOrmEntity): Neighborhood {
    return Neighborhood.restore({
      id: Id.restore(entity.id),
      name: entity.name,
      cityId: Id.restore(entity.city_id)
    })
  }
}
