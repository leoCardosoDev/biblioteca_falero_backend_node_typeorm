import { Id } from '@/shared/domain/value-objects/id'

import { LoadStateByUfRepository } from '../gateways/state-gateway'
import { LoadCityByNameAndStateRepository, AddCityRepository } from '../gateways/city-gateway'
import { LoadNeighborhoodByNameAndCityRepository, AddNeighborhoodRepository } from '../gateways/neighborhood-gateway'

export type GeoServiceInput = {
  uf: string
  city: string
  neighborhood: string
}

export type GeoIdsDTO = {
  stateId: Id
  cityId: Id
  neighborhoodId: Id
}

export class GetOrCreateGeoEntityService {
  constructor(
    private readonly loadStateByUfRepository: LoadStateByUfRepository,
    private readonly loadCityByNameAndStateRepository: LoadCityByNameAndStateRepository,
    private readonly addCityRepository: AddCityRepository,
    private readonly loadNeighborhoodByNameAndCityRepository: LoadNeighborhoodByNameAndCityRepository,
    private readonly addNeighborhoodRepository: AddNeighborhoodRepository
  ) { }

  async perform(dto: GeoServiceInput): Promise<GeoIdsDTO> {
    const { uf, city, neighborhood } = dto

    const stateModel = await this.loadStateByUfRepository.loadByUf(uf)
    if (!stateModel) {
      throw new Error(`State not found for UF: ${uf}`)
    }
    const stateId = stateModel.id

    let cityModel = await this.loadCityByNameAndStateRepository.loadByNameAndState(city, stateId.value)
    if (!cityModel) {
      cityModel = await this.addCityRepository.add(city, stateId.value)
    }
    const cityId = cityModel.id

    let neighborhoodModel = await this.loadNeighborhoodByNameAndCityRepository.loadByNameAndCity(neighborhood, cityId.value)
    if (!neighborhoodModel) {
      neighborhoodModel = await this.addNeighborhoodRepository.add(neighborhood, cityId.value)
    }

    return {
      stateId: stateId,
      cityId: cityId,
      neighborhoodId: neighborhoodModel.id
    }
  }
}
