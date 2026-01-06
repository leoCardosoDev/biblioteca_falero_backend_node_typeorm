import { ViaCepAdapter } from '@/infra/gateways/via-cep-adapter'
import { HttpClient, HttpRequest, HttpResponse } from '@/application/protocols/http/http-client'

type ViaCepResponse = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

class HttpClientSpy implements HttpClient<ViaCepResponse> {
  url?: string
  method?: string
  response: HttpResponse<ViaCepResponse> = {
    statusCode: 200,
    data: {
      cep: 'any_cep',
      logradouro: 'any_street',
      complemento: 'any_complement',
      bairro: 'any_neighborhood',
      localidade: 'any_city',
      uf: 'any_state'
    }
  }

  async request(data: HttpRequest): Promise<HttpResponse<ViaCepResponse>> {
    this.url = data.url
    this.method = data.method
    return this.response
  }
}

describe('ViaCepAdapter', () => {
  let sut: ViaCepAdapter
  let httpClientSpy: HttpClientSpy

  beforeEach(() => {
    httpClientSpy = new HttpClientSpy()
    sut = new ViaCepAdapter(httpClientSpy)
  })

  test('Should call HttpClient with correct URL', async () => {
    await sut.getByZipCode('any_zip_code')
    expect(httpClientSpy.url).toBe('https://viacep.com.br/ws/any_zip_code/json/')
    expect(httpClientSpy.method).toBe('get')
  })

  test('Should return AddressDTO on success', async () => {
    const address = await sut.getByZipCode('any_zip_code')
    expect(address).toEqual({
      zipCode: 'any_cep',
      street: 'any_street',
      neighborhood: 'any_neighborhood',
      city: 'any_city',
      state: 'any_state'
    })
  })

  test('Should return null if HttpClient returns error (via cep error field)', async () => {
    httpClientSpy.response = {
      statusCode: 200,
      data: {
        erro: true
      } as unknown as ViaCepResponse
    }
    const address = await sut.getByZipCode('any_zip_code')
    expect(address).toBeNull()
  })

  test('Should return null if HttpClient returns error (exception)', async () => {
    jest.spyOn(httpClientSpy, 'request').mockRejectedValueOnce(new Error())
    const address = await sut.getByZipCode('any_zip_code')
    expect(address).toBeNull()
  })
})
