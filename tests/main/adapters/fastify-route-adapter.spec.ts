import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols'
import { FastifyReply, FastifyRequest } from 'fastify'

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle(_httpRequest: HttpRequest): Promise<HttpResponse> {
      return Promise.resolve({
        statusCode: 200,
        body: { any: 'any' }
      })
    }
  }
  return new ControllerStub()
}

describe('FastifyRouteAdapter', () => {
  test('Should call controller with correct values', async () => {
    const controllerStub = makeController()
    const handleSpy = jest.spyOn(controllerStub, 'handle')
    const sut = adaptRoute(controllerStub)
    const request = {
      body: { any_body: 'any_body' },
      params: { any_param: 'any_param' }
    } as unknown as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply
    await sut(request, reply)
    expect(handleSpy).toHaveBeenCalledWith({
      body: request.body,
      params: request.params
    })
  })

  test('Should return success if controller returns 200-299', async () => {
    const controllerStub = makeController()
    const sut = adaptRoute(controllerStub)
    const request = { body: {}, params: {} } as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply
    await sut(request, reply)
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({ any: 'any' })
  })

  test('Should return error if controller returns error status code', async () => {
    const controllerStub = makeController()
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(Promise.resolve({
      statusCode: 400,
      body: new Error('any_error')
    }))
    const sut = adaptRoute(controllerStub)
    const request = { body: {}, params: {} } as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply
    const httpResponse = await sut(request, reply)
    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith(new Error('any_error'))
  })

  test('Should return 500 if controller returns 500', async () => {
    const controllerStub = makeController()
    const error = new Error('server_error')
    error.stack = 'any_stack'
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(Promise.resolve({
      statusCode: 500,
      body: error
    }))
    const sut = adaptRoute(controllerStub)
    const request = { body: {}, params: {} } as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply
    await sut(request, reply)
    expect(reply.status).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith(error)
  })
})
