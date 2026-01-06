import { CityModel } from '@/domain/models/city'

export interface LoadCityByNameAndStateRepository {
  loadByNameAndState(name: string, stateId: string): Promise<CityModel | undefined>
}
