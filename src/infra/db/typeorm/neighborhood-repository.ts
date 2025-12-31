import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Neighborhood } from './entities/neighborhood'
import { TypeOrmHelper } from './typeorm-helper'

export class NeighborhoodTypeOrmRepository implements AddNeighborhoodRepository {
  async findByNameAndCity(name: string, cityId: string): Promise<NeighborhoodModel | undefined> {
    const repo = await TypeOrmHelper.getRepository(Neighborhood)
    const neighborhood = await repo.findOne({ where: { name, city_id: cityId } })
    return neighborhood || undefined
  }

  async add(name: string, cityId: string): Promise<NeighborhoodModel> {
    const repo = await TypeOrmHelper.getRepository(Neighborhood)
    const neighborhood = repo.create({
      name,
      city_id: cityId,
      created_at: new Date() // Explicitly setting it, though DB default handles it too
    })
    const saved = await repo.save(neighborhood)
    return saved
  }
}
