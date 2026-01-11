import { LoadAddressByZipCode, ResolvedAddress } from '@/domain/usecases/load-address-by-zip-code'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { Either, left, right } from '@/shared/either'
import { NotFoundError } from '@/domain/errors/not-found-error'

export class DbLoadAddressByZipCode implements LoadAddressByZipCode {
  constructor(
    private readonly addressGateway: AddressGateway,
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService
  ) { }

  async load(zipCode: string): Promise<Either<Error, ResolvedAddress>> {
    const address = await this.addressGateway.getByZipCode(zipCode)
    if (!address) {
      return left(new NotFoundError('Address not found for the provided ZipCode'))
    }

    const geoIds = await this.getOrCreateGeoEntityService.perform({
      uf: address.state,
      city: address.city,
      neighborhood: address.neighborhood
    })

    return right({
      ...address,
      stateId: geoIds.stateId.value,
      cityId: geoIds.cityId.value,
      neighborhoodId: geoIds.neighborhoodId.value
    })
  }
}
