import { LoadAddressByZipCodeController } from '@/modules/geography/presentation/controllers/load-address-by-zip-code-controller'
import { LoadAddressByZipCode, ResolvedAddress } from '@/modules/geography/domain/usecases/load-address-by-zip-code'
import { ok, notFound, serverError } from '@/shared/presentation/helpers/http-helper'
import { HttpRequest } from '@/shared/presentation/protocols'
import { Either, right, left, Right } from '@/shared/application/either'

class LoadAddressByZipCodeSpy implements LoadAddressByZipCode {
  zipCode: string | undefined
  result: Either<Error, ResolvedAddress> = right({
    zipCode: 'any_zip',
    street: 'any_street',
    neighborhood: 'any_neighborhood',
    city: 'any_city',
    state: 'any_state',
    stateId: 'any_state_id',
    cityId: 'any_city_id',
    neighborhoodId: 'any_neighborhood_id'
  })

  async load(zipCode: string): Promise<Either<Error, ResolvedAddress>> {
    this.zipCode = zipCode
    return this.result
  }
}

const mockRequest = (): HttpRequest => ({
  params: {
    zipCode: '12345678'
  }
})

import { Validation } from '@/shared/presentation/protocols'

class ValidationStub implements Validation {
  validate(_input: unknown): Error | undefined {
    return undefined
  }
}

type SutTypes = {
  sut: LoadAddressByZipCodeController
  loadAddressByZipCodeSpy: LoadAddressByZipCodeSpy
  validationStub: ValidationStub
}

const makeSut = (): SutTypes => {
  const loadAddressByZipCodeSpy = new LoadAddressByZipCodeSpy()
  const validationStub = new ValidationStub()
  const sut = new LoadAddressByZipCodeController(loadAddressByZipCodeSpy, validationStub)
  return {
    sut,
    loadAddressByZipCodeSpy,
    validationStub
  }
}

describe('LoadAddressByZipCodeController', () => {
  test('Should return 400 if validation fails', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
    const result = await sut.handle({ params: { zipCode: 'invalid' } })
    expect(result.statusCode).toBe(400)
  })

  test('Should call LoadAddressByZipCode with correct valus', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    await sut.handle(mockRequest())
    expect(loadAddressByZipCodeSpy.zipCode).toBe('12345678')
  })

  test('Should return 404 if LoadAddressByZipCode returns left', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    loadAddressByZipCodeSpy.result = left(new Error('Address not found'))
    const result = await sut.handle(mockRequest())
    expect(result).toEqual(notFound(new Error('Address not found')))
  })

  test('Should return 200 on success', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    const result = await sut.handle(mockRequest())
    expect(result).toEqual(ok((loadAddressByZipCodeSpy.result as Right<Error, ResolvedAddress>).value))
  })

  test('Should return 500 if LoadAddressByZipCode throws', async () => {
    const { sut, loadAddressByZipCodeSpy } = makeSut()
    jest.spyOn(loadAddressByZipCodeSpy, 'load').mockRejectedValueOnce(new Error())
    const result = await sut.handle(mockRequest())
    expect(result).toEqual(serverError(new Error()))
  })
})
