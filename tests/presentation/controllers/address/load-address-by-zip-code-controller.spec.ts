import { LoadAddressByZipCodeController } from '@/presentation/controllers/address/load-address-by-zip-code-controller'
import { LoadAddressByZipCode, ResolvedAddress } from '@/domain/usecases/load-address-by-zip-code'
import { ok, notFound, serverError } from '@/presentation/helpers/http-helper'
import { HttpRequest } from '@/presentation/protocols'

class LoadAddressByZipCodeSpy implements LoadAddressByZipCode {
  zipCode: string | undefined
  result: ResolvedAddress | null = {
    zipCode: 'any_zip',
    street: 'any_street',
    neighborhood: 'any_neighborhood',
    city: 'any_city',
    state: 'any_state',
    stateId: 'any_state_id',
    cityId: 'any_city_id',
    neighborhoodId: 'any_neighborhood_id'
  }

  async load(zipCode: string): Promise<ResolvedAddress | null> {
    this.zipCode = zipCode
    return this.result
  }
}

const mockRequest = (): HttpRequest => ({
  params: {
    zipCode: '12345678'
  }
})

type SutTypes = {
  sut: LoadAddressByZipCodeController
  loadAddressByZipCodeSpy: LoadAddressByZipCodeSpy
}

const makeSut = (): SutTypes => {
  const loadAddressByZipCodeSpy = new LoadAddressByZipCodeSpy()
  const sut = new LoadAddressByZipCodeController(loadAddressByZipCodeSpy)
  return {
    sut,
    loadAddressByZipCodeSpy
  }
}

describe('LoadAddressByZipCodeController', () => {
  test('Should return 400 if validation fails', async () => {
    const { sut } = makeSut()
    const result = await sut.handle({ params: { zipCode: 'invalid' } })
    expect(result.statusCode).toBe(400)
  })

  test('Should call LoadAddressByZipCode with correct valus', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    await sut.handle(mockRequest())
    expect(loadAddressByZipCodeSpy.zipCode).toBe('12345678')
  })

  test('Should return 404 if LoadAddressByZipCode returns null', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    loadAddressByZipCodeSpy.result = null
    const result = await sut.handle(mockRequest())
    expect(result).toEqual(notFound(new Error('Address not found')))
  })

  test('Should return 200 on success', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    const result = await sut.handle(mockRequest())
    expect(result).toEqual(ok(loadAddressByZipCodeSpy.result))
  })

  test('Should return 500 if LoadAddressByZipCode throws', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    jest.spyOn(loadAddressByZipCodeSpy, 'load').mockRejectedValueOnce(new Error())
    const result = await sut.handle(mockRequest())
    expect(result).toEqual(serverError(new Error()))
  })
})
