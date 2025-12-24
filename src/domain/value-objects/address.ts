import { InvalidAddressError } from '@/domain/errors/invalid-address-error'

export interface AddressProps {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export class Address {
  readonly street: string
  readonly number: string
  readonly complement?: string
  readonly neighborhood: string
  readonly city: string
  readonly state: string
  readonly zipCode: string

  private constructor(props: AddressProps) {
    this.street = props.street
    this.number = props.number
    this.complement = props.complement
    this.neighborhood = props.neighborhood
    this.city = props.city
    this.state = props.state
    this.zipCode = props.zipCode
  }

  static create(props: AddressProps): Address | InvalidAddressError {
    if (!props.street || !props.street.trim()) {
      return new InvalidAddressError('street is required')
    }
    if (!props.number || !props.number.trim()) {
      return new InvalidAddressError('number is required')
    }
    if (!props.neighborhood || !props.neighborhood.trim()) {
      return new InvalidAddressError('neighborhood is required')
    }
    if (!props.city || !props.city.trim()) {
      return new InvalidAddressError('city is required')
    }
    if (!props.state || props.state.length !== 2) {
      return new InvalidAddressError('state must be 2 characters')
    }
    const cleanZip = props.zipCode.replace(/\D/g, '')
    if (cleanZip.length !== 8) {
      return new InvalidAddressError('zipCode must be 8 digits')
    }
    return new Address({
      street: props.street.trim(),
      number: props.number.trim(),
      complement: props.complement?.trim(),
      neighborhood: props.neighborhood.trim(),
      city: props.city.trim(),
      state: props.state.toUpperCase(),
      zipCode: cleanZip
    })
  }
}
