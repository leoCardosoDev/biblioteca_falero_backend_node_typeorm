import { adaptMiddleware } from '@/main/adapters/fastify-middleware-adapter'
import { Middleware, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { FastifyReply, FastifyRequest } from 'fastify'

const makeMiddleware = (): Middleware => {
  class MiddlewareStub implements Middleware {
    async handle(_httpRequest: HttpRequest): Promise<HttpResponse> {
      return Promise.resolve({
        statusCode: 200,
        body: { userId: 'any_id', role: 'any_role' }
      })
    }
  }
  return new MiddlewareStub()
}

describe('FastifyMiddlewareAdapter', () => {
  test('Should call middleware with correct values', async () => {
    const middlewareStub = makeMiddleware()
    const handleSpy = jest.spyOn(middlewareStub, 'handle')
    const sut = adaptMiddleware(middlewareStub)
    const request = {
      headers: { 'any-header': 'any_value' },
      userId: 'other_id',
      role: 'other_role'
    } as unknown as FastifyRequest
    const reply = {} as FastifyReply
    await sut(request, reply)
    expect(handleSpy).toHaveBeenCalledWith({
      headers: request.headers,
      userId: 'other_id',
      role: 'other_role'
    })
  })

  test('Should enrich request if middleware returns 200', async () => {
    const middlewareStub = makeMiddleware()
    const sut = adaptMiddleware(middlewareStub)
    const request = {} as unknown as Record<string, unknown>
    const reply = {} as FastifyReply
    await sut(request as unknown as FastifyRequest, reply)
    expect(request.userId).toBe('any_id')
    expect(request.role).toBe('any_role')
  })

  test('Should return error if middleware returns error status code', async () => {
    const middlewareStub = makeMiddleware()
    jest.spyOn(middlewareStub, 'handle').mockReturnValueOnce(Promise.resolve({
      statusCode: 403,
      body: new Error('any_error')
    }))
    const sut = adaptMiddleware(middlewareStub)
    const request = {} as FastifyRequest
    const reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply
    await sut(request, reply)
    expect(reply.status).toHaveBeenCalledWith(403)
    expect(reply.send).toHaveBeenCalledWith(new Error('any_error'))
  })
})
