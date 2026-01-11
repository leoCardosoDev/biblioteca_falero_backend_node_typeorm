import { LoadCityById } from '@/domain/usecases/load-city-by-id'
import { LoadCityByIdRepository } from '@/application/protocols/db/city/load-city-by-id-repository'
import { CityModel } from '@/domain/models/city'

export class DbLoadCityById implements LoadCityById {
  constructor(private readonly loadCityByIdRepository: LoadCityByIdRepository) { }

  async load(id: string): Promise<CityModel | undefined> {
    return await this.loadCityByIdRepository.loadById(id)
  }
}
