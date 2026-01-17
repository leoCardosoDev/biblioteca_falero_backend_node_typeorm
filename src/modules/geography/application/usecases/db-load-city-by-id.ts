import { LoadCityById } from '@/modules/geography/application/usecases/load-city-by-id'
import { LoadCityByIdRepository } from '@/modules/geography/application/protocols/db/city/load-city-by-id-repository'
import { CityModel } from '@/modules/geography/domain/models/city'

export class DbLoadCityById implements LoadCityById {
  constructor(private readonly loadCityByIdRepository: LoadCityByIdRepository) { }

  async load(id: string): Promise<CityModel | undefined> {
    return await this.loadCityByIdRepository.loadById(id)
  }
}
