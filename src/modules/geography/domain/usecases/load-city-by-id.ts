import { CityModel } from '../models/city'

export interface LoadCityById {
  load: (id: string) => Promise<CityModel | undefined>
}
