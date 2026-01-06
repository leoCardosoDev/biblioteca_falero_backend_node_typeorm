import { CityModel } from '@/domain/models/city'

export interface AddCityRepository {
  add(name: string, stateId: string): Promise<CityModel>
}
