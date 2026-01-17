export interface AddressDTO {
  zipCode: string
  street: string
  neighborhood: string
  city: string
  state: string
}

export interface AddressGateway {
  getByZipCode: (zipCode: string) => Promise<AddressDTO | null>
}
