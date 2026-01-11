import { LoadStateByIdController } from '@/presentation/controllers/load-state-by-id-controller'
import { LoadStateById } from '@/domain/usecases/load-state-by-id'
import { StateModel } from '@/domain/models/state'
import { Id } from '@/domain/value-objects/id'
import { ok, serverError, noContent } from '@/presentation/helpers/http-helper'
import { HttpRequest } from '@/presentation/protocols/http'

import crypto from 'crypto'

class LoadStateByIdSpy implements LoadStateById {
  id?: string
  result?: StateModel = {
    id: Id.create(crypto.randomUUID()) as Id,
    name: 'any_name',
    uf: 'UF'
  }

  async load(id: string): Promise<StateModel | undefined> {
    this.id = id
    return this.result
  }
}

type SutTypes = {
  sut: LoadStateByIdController
  loadStateByIdSpy: LoadStateByIdSpy
}

const makeSut = (): SutTypes => {
  const loadStateByIdSpy = new LoadStateByIdSpy()
  const sut = new LoadStateByIdController(loadStateByIdSpy)
  return {
    sut,
    loadStateByIdSpy
  }
}

const mockRequest = (): HttpRequest => ({
  params: {
    id: crypto.randomUUID()
  }
})

describe('LoadStateByIdController', () => {
  test('Should call LoadStateById with correct id', async () => {
    const { sut, loadStateByIdSpy } = makeSut()
    const httpRequest = mockRequest()
    await sut.handle(httpRequest)
    expect(loadStateByIdSpy.id).toBe((httpRequest.params as { id: string }).id)
  })

  test('Should return 204 if LoadStateById returns undefined', async () => {
    const { sut, loadStateByIdSpy } = makeSut()
    loadStateByIdSpy.result = undefined
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(noContent())
  })

  test('Should return 200 with state if LoadStateById returns a state', async () => {
    const { sut, loadStateByIdSpy } = makeSut()
    const httpRequest = mockRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(ok({
      id: loadStateByIdSpy.result!.id.value,
      name: loadStateByIdSpy.result!.name,
      uf: loadStateByIdSpy.result!.uf
    }))
  })

  test('Should return 500 if LoadStateById throws', async () => {
    const { sut, loadStateByIdSpy } = makeSut()
    jest.spyOn(loadStateByIdSpy, 'load').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
