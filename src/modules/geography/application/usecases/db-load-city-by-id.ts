import { City } from '@/modules/geography/domain'
import { LoadCityById } from '@/modules/geography/application/usecases/load-city-by-id'
import { LoadCityByIdRepository } from '@/modules/geography/application/protocols/db/city/load-city-by-id-repository'

export class DbLoadCityById implements LoadCityById {
  constructor(private readonly loadCityByIdRepository: LoadCityByIdRepository) { }

  async load(id: string): Promise<City | undefined> {
    return await this.loadCityByIdRepository.loadById(id)
  }
}
