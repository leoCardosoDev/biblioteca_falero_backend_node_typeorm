import { City } from '../entities/city'

export interface LoadCityByNameAndStateRepository {
  loadByNameAndState(name: string, stateId: string): Promise<City | undefined>
}

export interface AddCityRepository {
  add(name: string, stateId: string): Promise<City>
}
