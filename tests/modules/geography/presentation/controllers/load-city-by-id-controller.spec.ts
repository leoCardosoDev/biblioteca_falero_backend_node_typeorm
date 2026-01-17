import { LoadCityByIdController } from '@/modules/geography/presentation/controllers/load-city-by-id-controller'
import { LoadCityById } from '@/modules/geography/application/usecases/load-city-by-id'
import { CityModel } from '@/modules/geography/domain/models/city'
import { Id } from '@/shared/domain/value-objects/id'
import { ok, serverError } from '@/shared/presentation/helpers/http-helper'
import { HttpRequest } from '@/modules/geography/presentation/protocols/http'

import crypto from 'crypto'

class LoadCityByIdSpy implements LoadCityById {
  id?: string
  result?: CityModel = {
    id: Id.create(crypto.randomUUID()) as Id,
    name: 'any_name',
    stateId: Id.create(crypto.randomUUID()) as Id
  }

  async load(id: string): Promise<CityModel | undefined> {
    this.id = id
    return this.result
  }
}

type SutTypes = {
  sut: LoadCityByIdController
  loadCityByIdSpy: LoadCityByIdSpy
}

const makeSut = (): SutTypes => {
  const loadCityByIdSpy = new LoadCityByIdSpy()
  const sut = new LoadCityByIdController(loadCityByIdSpy)
  return {
    sut,
    loadCityByIdSpy
  }
}

const mockRequest = (): HttpRequest => ({
  params: {
    id: crypto.randomUUID()
  }
})

describe('LoadCityByIdController', () => {
  test('Should call LoadCityById with correct id', async () => {
    const { sut, loadCityByIdSpy } = makeSut()
    const httpRequest = mockRequest()
    await sut.handle(httpRequest)
    expect(loadCityByIdSpy.id).toBe((httpRequest.params as { id: string }).id)
  })

  test('Should return 400 if LoadCityById returns undefined', async () => {
    const { sut, loadCityByIdSpy } = makeSut()
    loadCityByIdSpy.result = undefined
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('City not found'))
  })

  test('Should return 200 with city if LoadCityById returns a city', async () => {
    const { sut, loadCityByIdSpy } = makeSut()
    const httpRequest = mockRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(ok(loadCityByIdSpy.result))
  })

  test('Should return 500 if LoadCityById throws', async () => {
    const { sut, loadCityByIdSpy } = makeSut()
    jest.spyOn(loadCityByIdSpy, 'load').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
