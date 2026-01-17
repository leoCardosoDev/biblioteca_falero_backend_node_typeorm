import { LoadNeighborhoodByIdController } from '@/modules/geography/presentation/controllers/load-neighborhood-by-id-controller'
import { LoadNeighborhoodById } from '@/modules/geography/application/usecases/load-neighborhood-by-id'
import { NeighborhoodModel } from '@/modules/geography/domain/models/neighborhood'
import { Id } from '@/shared/domain/value-objects/id'
import { ok, serverError } from '@/shared/presentation'
import { HttpRequest } from '@/modules/geography/presentation/protocols/http'

import crypto from 'crypto'

class LoadNeighborhoodByIdSpy implements LoadNeighborhoodById {
  id?: string
  result: NeighborhoodModel | null = {
    id: Id.create(crypto.randomUUID()),
    name: 'any_name',
    cityId: Id.create(crypto.randomUUID())
  }

  async load(id: string): Promise<NeighborhoodModel | null> {
    this.id = id
    return this.result
  }
}

type SutTypes = {
  sut: LoadNeighborhoodByIdController
  loadNeighborhoodByIdSpy: LoadNeighborhoodByIdSpy
}

const makeSut = (): SutTypes => {
  const loadNeighborhoodByIdSpy = new LoadNeighborhoodByIdSpy()
  const sut = new LoadNeighborhoodByIdController(loadNeighborhoodByIdSpy)
  return {
    sut,
    loadNeighborhoodByIdSpy
  }
}

const mockRequest = (): HttpRequest => ({
  params: {
    id: crypto.randomUUID()
  }
})

describe('LoadNeighborhoodByIdController', () => {
  test('Should call LoadNeighborhoodById with correct id', async () => {
    const { sut, loadNeighborhoodByIdSpy } = makeSut()
    const httpRequest = mockRequest()
    await sut.handle(httpRequest)
    expect(loadNeighborhoodByIdSpy.id).toBe((httpRequest.params as { id: string }).id)
  })

  test('Should return 400 if LoadNeighborhoodById returns null', async () => {
    const { sut, loadNeighborhoodByIdSpy } = makeSut()
    loadNeighborhoodByIdSpy.result = null
    const httpResponse = await sut.handle(mockRequest())
    // Controller returns badRequest (400) not 404
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Neighborhood not found'))
  })

  test('Should return 200 with neighborhood if LoadNeighborhoodById returns a neighborhood', async () => {
    const { sut, loadNeighborhoodByIdSpy } = makeSut()
    const httpRequest = mockRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(ok(loadNeighborhoodByIdSpy.result))
  })

  test('Should return 500 if LoadNeighborhoodById throws', async () => {
    const { sut, loadNeighborhoodByIdSpy } = makeSut()
    jest.spyOn(loadNeighborhoodByIdSpy, 'load').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
