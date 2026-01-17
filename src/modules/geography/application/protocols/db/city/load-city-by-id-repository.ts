import { City } from '@/modules/geography/domain'

export interface LoadCityByIdRepository {
  loadById: (id: string) => Promise<City | undefined>
}
