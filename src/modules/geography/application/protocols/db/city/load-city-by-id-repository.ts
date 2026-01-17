import { CityModel } from '@/modules/geography/domain/models/city'

export interface LoadCityByIdRepository {
  loadById: (id: string) => Promise<CityModel | undefined>
}
