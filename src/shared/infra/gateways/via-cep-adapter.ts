import { HttpClient } from '@/shared/application/protocols/http/http-client'
import { AddressDTO, AddressGateway } from '@/shared/domain/gateways/address-gateway'

export type ViaCepResponse = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export class ViaCepAdapter implements AddressGateway {
  constructor(private readonly httpClient: HttpClient<ViaCepResponse>) { }

  async getByZipCode(zipCode: string): Promise<AddressDTO | null> {
    try {
      const response = await this.httpClient.request({
        url: `https://viacep.com.br/ws/${zipCode}/json/`,
        method: 'get'
      })

      if (response.data.erro) {
        return null
      }

      return {
        zipCode: response.data.cep,
        street: response.data.logradouro,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf
      }
    } catch {
      return null
    }
  }
}
