import { Address } from '@/domain/value-objects/address'
import { Id } from '@/domain/value-objects/id'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { AddUserParams } from '@/domain/usecases/add-user'
import { AddressGateway } from '@/domain/gateways/address-gateway'
import { LoadAddressByZipCode, ResolvedAddress } from '@/domain/usecases/load-address-by-zip-code'

type AddressParams = AddUserParams['address']

export interface AddressResolutionProtocol {
  resolve(addressData: AddressParams): Promise<Address | undefined | Error>
}

export class AddressResolutionService implements AddressResolutionProtocol, LoadAddressByZipCode {
  constructor(
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService,
    private readonly addressGateway: AddressGateway
  ) { }

  async load(zipCode: string): Promise<ResolvedAddress | null> {
    const externalAddress = await this.addressGateway.getByZipCode(zipCode)
    if (!externalAddress) {
      return null
    }

    const geoIds = await this.getOrCreateGeoEntityService.perform({
      uf: externalAddress.state,
      city: externalAddress.city,
      neighborhood: externalAddress.neighborhood
    })

    return {
      ...externalAddress,
      stateId: geoIds.stateId.value,
      cityId: geoIds.cityId.value,
      neighborhoodId: geoIds.neighborhoodId.value
    }
  }

  async resolve(addressData: AddressParams): Promise<Address | undefined | Error> {
    if (!addressData) {
      return undefined
    }

    // Initialize with values from input (strings)
    let cityIdResult: Id | undefined
    let neighborhoodIdResult: Id | undefined
    let stateIdResult: Id | undefined

    // Try to convert input strings to Ids
    if (typeof addressData.cityId === 'string') {
      cityIdResult = Id.create(addressData.cityId)
    } else {
      cityIdResult = addressData.cityId as Id | undefined
    }

    if (typeof addressData.neighborhoodId === 'string') {
      neighborhoodIdResult = Id.create(addressData.neighborhoodId)
    } else {
      neighborhoodIdResult = addressData.neighborhoodId as Id | undefined
    }

    if (typeof addressData.stateId === 'string') {
      stateIdResult = Id.create(addressData.stateId)
    } else {
      stateIdResult = addressData.stateId as Id | undefined
    }

    if (this.shouldLookUpGeoEntities(addressData)) {
      const geoIds = await this.getOrCreateGeoEntityService.perform({
        uf: addressData.state!,
        city: addressData.city!,
        neighborhood: addressData.neighborhood!
      })
      cityIdResult = geoIds.cityId
      neighborhoodIdResult = geoIds.neighborhoodId
      stateIdResult = geoIds.stateId
    } else if (this.shouldLookUpExternalAddress(cityIdResult, neighborhoodIdResult, stateIdResult, addressData.zipCode)) {
      // New logic: External Lookup
      const externalAddress = await this.addressGateway.getByZipCode(addressData.zipCode!)
      if (externalAddress) {
        const geoIds = await this.getOrCreateGeoEntityService.perform({
          uf: externalAddress.state,
          city: externalAddress.city,
          neighborhood: externalAddress.neighborhood
        })
        cityIdResult = geoIds.cityId
        neighborhoodIdResult = geoIds.neighborhoodId
        stateIdResult = geoIds.stateId

        // Auto-fill missing fields if not provided in request but found in external
        if (!addressData.street) addressData.street = externalAddress.street
        if (!addressData.complement) addressData.complement = undefined // ViaCEP no longer provides reliable complement for all
      }
    }

    if (!cityIdResult) return new InvalidAddressError('The address city is required')
    if (!neighborhoodIdResult) return new InvalidAddressError('The address neighborhood is required')
    if (!stateIdResult) return new InvalidAddressError('The address state is required')

    return Address.create({
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement,
      zipCode: addressData.zipCode,
      cityId: cityIdResult,
      neighborhoodId: neighborhoodIdResult,
      stateId: stateIdResult,
    })
  }

  private shouldLookUpGeoEntities(address: NonNullable<AddressParams>): boolean {
    const missingIds = !address.cityId || !address.neighborhoodId || !address.stateId
    const hasGeoNames = !!(address.city && address.neighborhood && address.state)
    return missingIds && hasGeoNames
  }

  private shouldLookUpExternalAddress(cityId: Id | undefined, neighborhoodId: Id | undefined, stateId: Id | undefined, zipCode: string | undefined): boolean {
    const missingIds = !cityId || !neighborhoodId || !stateId
    return missingIds && !!zipCode
  }
}
