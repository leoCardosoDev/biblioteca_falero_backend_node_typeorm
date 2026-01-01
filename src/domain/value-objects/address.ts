import { InvalidAddressError } from '@/domain/errors/invalid-address-error'

export interface AddressProps {
  street: string
  number: string
  complement?: string
  neighborhoodId: string
  cityId: string
  zipCode: string
}

export class Address {
  readonly street: string
  readonly number: string
  readonly complement?: string
  readonly neighborhoodId: string
  readonly cityId: string
  readonly zipCode: string

  private constructor(props: AddressProps) {
    this.street = props.street
    this.number = props.number
    this.complement = props.complement
    this.neighborhoodId = props.neighborhoodId
    this.cityId = props.cityId
    this.zipCode = props.zipCode
  }

  static create(props: AddressProps): Address | InvalidAddressError {
    if (!props.street || !props.street.trim()) {
      return new InvalidAddressError('street is required')
    }
    if (!props.number || !props.number.trim()) {
      return new InvalidAddressError('number is required')
    }
    if (!props.neighborhoodId || !props.neighborhoodId.trim()) {
      return new InvalidAddressError('neighborhoodId is required')
    }
    if (!props.cityId || !props.cityId.trim()) {
      return new InvalidAddressError('cityId is required')
    }
    const cleanZip = props.zipCode.replace(/\D/g, '')
    if (cleanZip.length !== 8) {
      return new InvalidAddressError('zipCode must be 8 digits')
    }
    return new Address({
      street: props.street.trim(),
      number: props.number.trim(),
      complement: props.complement?.trim(),
      neighborhoodId: props.neighborhoodId.trim(),
      cityId: props.cityId.trim(),
      zipCode: cleanZip
    })
  }
}
