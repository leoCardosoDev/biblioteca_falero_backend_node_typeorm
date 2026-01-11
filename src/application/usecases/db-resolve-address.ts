import { Either, left, right } from '@/shared/either'
import { ResolveAddress, ResolveAddressInput } from '@/domain/usecases/resolve-address'
import { AddressResolutionPolicy, AddressPolicyParams, ResolutionStrategy } from '@/domain/services/address/address-resolution-policy'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { Address } from '@/domain/value-objects/address'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'
import { Id } from '@/domain/value-objects/id'

export class DbResolveAddress implements ResolveAddress {
  constructor(
    private readonly addressResolutionPolicy: AddressResolutionPolicy,
    private readonly addressGateway: AddressGateway,
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService
  ) { }

  async resolve(input: ResolveAddressInput): Promise<Either<InvalidAddressError, Address>> {
    const policyParams: AddressPolicyParams = {
      cityId: input.cityId,
      neighborhoodId: input.neighborhoodId,
      stateId: input.stateId,
      city: input.city,
      neighborhood: input.neighborhood,
      state: input.state,
      zipCode: input.zipCode
    }

    const strategy = this.addressResolutionPolicy.determineStrategy(policyParams)

    if (strategy === ResolutionStrategy.INVALID) {
      return left(new InvalidAddressError('Invalid address parameters for resolution'))
    }

    if (strategy === ResolutionStrategy.USE_PROVIDED_IDS) {
      if (!input.cityId || !input.neighborhoodId || !input.stateId) {
        return left(new InvalidAddressError('Missing required IDs despite strategy'))
      }

      const addressOrError = Address.create({
        street: input.street || '',
        number: input.number || '',
        complement: input.complement,
        zipCode: input.zipCode,
        neighborhoodId: Id.create(input.neighborhoodId),
        cityId: Id.create(input.cityId),
        stateId: Id.create(input.stateId),
        neighborhood: input.neighborhood,
        city: input.city,
        state: input.state
      })

      if (addressOrError instanceof Error) {
        return left(addressOrError)
      }
      return right(addressOrError)
    }

    let cityId: Id | undefined
    let neighborhoodId: Id | undefined
    let stateId: Id | undefined
    let resolvedStreet = input.street
    const resolvedComplement = input.complement

    if (strategy === ResolutionStrategy.LOOKUP_EXTERNAL) {
      if (!input.zipCode) return left(new InvalidAddressError('ZipCode required for external lookup'))

      const externalAddress = await this.addressGateway.getByZipCode(input.zipCode)
      if (!externalAddress) {
        return left(new InvalidAddressError('Address not found for the provided ZipCode'))
      }

      const geoIds = await this.getOrCreateGeoEntityService.perform({
        uf: externalAddress.state,
        city: externalAddress.city,
        neighborhood: externalAddress.neighborhood
      })

      cityId = geoIds.cityId
      neighborhoodId = geoIds.neighborhoodId
      stateId = geoIds.stateId
      resolvedStreet = input.street || externalAddress.street
    }

    if (strategy === ResolutionStrategy.LOOKUP_GEO_ENTITIES) {

      const geoIds = await this.getOrCreateGeoEntityService.perform({
        uf: input.state!,
        city: input.city!,
        neighborhood: input.neighborhood!
      })
      cityId = geoIds.cityId
      neighborhoodId = geoIds.neighborhoodId
      stateId = geoIds.stateId
    }

    if (!cityId || !neighborhoodId || !stateId) {
      return left(new InvalidAddressError('Failed to resolve address IDs'))
    }

    const addressOrError = Address.create({
      street: resolvedStreet || '',
      number: input.number || '',
      complement: resolvedComplement,
      zipCode: input.zipCode,
      cityId,
      neighborhoodId,
      stateId
    })

    if (addressOrError instanceof Error) {
      return left(addressOrError)
    }

    return right(addressOrError)
  }
}
