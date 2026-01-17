import { CityModel } from '@/modules/geography/domain'

export interface LoadCityById {
  load: (id: string) => Promise<CityModel | undefined>
}
