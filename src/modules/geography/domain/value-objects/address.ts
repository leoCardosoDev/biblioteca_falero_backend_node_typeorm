import { Either, left, right } from '@/shared/application/either'
import { Id } from '@/shared/domain/value-objects/id'
import { InvalidAddressError } from '@/shared/domain/errors'

const ZIP_CODE_LENGTH = 8

export interface AddressProps {
  street: string
  number: string
  complement?: string
  neighborhoodId: Id
  neighborhood?: string
  cityId: Id
  city?: string
  stateId: Id
  state?: string
  zipCode: string
}

export class Address {
  readonly street: string
  readonly number: string
  readonly complement?: string
  readonly neighborhoodId: Id
  readonly neighborhood?: string
  readonly cityId: Id
  readonly city?: string
  readonly stateId: Id
  readonly state?: string
  readonly zipCode: string

  private constructor(props: AddressProps) {
    this.street = props.street
    this.number = props.number
    this.complement = props.complement
    this.neighborhoodId = props.neighborhoodId
    this.neighborhood = props.neighborhood
    this.cityId = props.cityId
    this.city = props.city
    this.stateId = props.stateId
    this.state = props.state
    this.zipCode = props.zipCode
  }

  static create(props: AddressProps): Either<InvalidAddressError, Address> {
    if (!props.street || !props.street.trim()) {
      return left(new InvalidAddressError('The address street is required'))
    }
    if (!props.number || !props.number.trim()) {
      return left(new InvalidAddressError('The address number is required'))
    }
    if (!props.neighborhoodId) {
      return left(new InvalidAddressError('The address neighborhood is required'))
    }
    if (!props.cityId) {
      return left(new InvalidAddressError('The address city is required'))
    }
    if (!props.stateId) {
      return left(new InvalidAddressError('The address state is required'))
    }

    const cleanZip = props.zipCode.replace(/\D/g, '')
    if (cleanZip.length !== ZIP_CODE_LENGTH) {
      return left(new InvalidAddressError('The address zipCode must be 8 digits'))
    }
    return right(new Address({
      street: props.street.trim(),
      number: props.number.trim(),
      complement: props.complement?.trim(),
      neighborhoodId: props.neighborhoodId,
      neighborhood: props.neighborhood,
      cityId: props.cityId,
      city: props.city,
      stateId: props.stateId,
      state: props.state,
      zipCode: cleanZip
    }))
  }

  static restore(props: AddressProps): Address {
    return new Address(props)
  }
}
