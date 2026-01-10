import { CityModel } from '@/domain/models/city'

export interface LoadCityByIdRepository {
  loadById: (id: string) => Promise<CityModel | undefined>
}
