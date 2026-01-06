import { LoadStateByUfRepository } from '@/application/protocols/db/state/load-state-by-uf-repository'
import { LoadCityByNameAndStateRepository } from '@/application/protocols/db/city/load-city-by-name-and-state-repository'
import { AddCityRepository } from '@/application/protocols/db/city/add-city-repository'
import { LoadNeighborhoodByNameAndCityRepository } from '@/application/protocols/db/neighborhood/load-neighborhood-by-name-and-city-repository'
import { AddNeighborhoodRepository } from '@/application/protocols/db/neighborhood/add-neighborhood-repository'

export type AddressDTO = {
  uf: string
  city: string
  neighborhood: string
}

export type GeoIdsDTO = {
  stateId: string
  cityId: string
  neighborhoodId: string
}

export class GetOrCreateGeoEntityService {
  constructor(
    private readonly loadStateByUfRepository: LoadStateByUfRepository,
    private readonly loadCityByNameAndStateRepository: LoadCityByNameAndStateRepository,
    private readonly addCityRepository: AddCityRepository,
    private readonly loadNeighborhoodByNameAndCityRepository: LoadNeighborhoodByNameAndCityRepository,
    private readonly addNeighborhoodRepository: AddNeighborhoodRepository
  ) { }

  async perform(dto: AddressDTO): Promise<GeoIdsDTO> {
    const { uf, city, neighborhood } = dto

    const stateModel = await this.loadStateByUfRepository.loadByUf(uf)
    if (!stateModel) {
      throw new Error(`State not found for UF: ${uf}`)
    }
    const stateIdStr = stateModel.id.value

    let cityModel = await this.loadCityByNameAndStateRepository.loadByNameAndState(city, stateIdStr)
    if (!cityModel) {
      cityModel = await this.addCityRepository.add(city, stateIdStr)
    }
    const cityIdStr = cityModel.id.value

    let neighborhoodModel = await this.loadNeighborhoodByNameAndCityRepository.loadByNameAndCity(neighborhood, cityIdStr)
    if (!neighborhoodModel) {
      neighborhoodModel = await this.addNeighborhoodRepository.add(neighborhood, cityIdStr)
    }

    return {
      stateId: stateIdStr,
      cityId: cityIdStr,
      neighborhoodId: neighborhoodModel.id.value
    }
  }
}
