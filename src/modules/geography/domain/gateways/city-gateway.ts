import { CityModel } from '../models/city'

export interface LoadCityByNameAndStateRepository {
  loadByNameAndState(name: string, stateId: string): Promise<CityModel | undefined>
}

export interface AddCityRepository {
  add(name: string, stateId: string): Promise<CityModel>
}
