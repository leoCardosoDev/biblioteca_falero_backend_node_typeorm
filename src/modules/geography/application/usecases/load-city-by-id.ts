import { City } from '@/modules/geography/domain'

export interface LoadCityById {
  load: (id: string) => Promise<City | undefined>
}
