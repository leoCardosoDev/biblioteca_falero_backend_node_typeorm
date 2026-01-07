import { Id } from '@/domain/value-objects/id'
import { InvalidAddressError } from '@/domain/errors/invalid-address-error'

export interface AddressProps {
  street: string
  number: string
  complement?: string
  neighborhoodId: Id
  cityId: Id
  stateId: Id
  zipCode: string
}

export class Address {
  readonly street: string
  readonly number: string
  readonly complement?: string
  readonly neighborhoodId: Id
  readonly cityId: Id
  readonly stateId: Id
  readonly zipCode: string

  private constructor(props: AddressProps) {
    this.street = props.street
    this.number = props.number
    this.complement = props.complement
    this.neighborhoodId = props.neighborhoodId
    this.cityId = props.cityId
    this.stateId = props.stateId
    this.zipCode = props.zipCode
  }

  static create(props: AddressProps): Address | InvalidAddressError {
    if (!props.street || !props.street.trim()) {
      return new InvalidAddressError('The address street is required')
    }
    if (!props.number || !props.number.trim()) {
      return new InvalidAddressError('The address number is required')
    }
    // IDs are assumed valid as they are Id objects, but checking for presence (though TS enforces it)
    if (!props.neighborhoodId) {
      return new InvalidAddressError('The address neighborhood is required')
    }
    if (!props.cityId) {
      return new InvalidAddressError('The address city is required')
    }
    if (!props.stateId) {
      return new InvalidAddressError('The address state is required')
    }

    const cleanZip = props.zipCode.replace(/\D/g, '')
    if (cleanZip.length !== 8) {
      return new InvalidAddressError('The address zipCode must be 8 digits')
    }
    return new Address({
      street: props.street.trim(),
      number: props.number.trim(),
      complement: props.complement?.trim(),
      neighborhoodId: props.neighborhoodId,
      cityId: props.cityId,
      stateId: props.stateId,
      zipCode: cleanZip
    })
  }
  static restore(props: AddressProps): Address {
    return new Address(props)
  }
}
