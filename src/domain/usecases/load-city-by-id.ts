import { CityModel } from '@/domain/models/city'

export interface LoadCityById {
  load: (id: string) => Promise<CityModel | undefined>
}
