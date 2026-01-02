
import { badRequest, unauthorized, forbidden, notFound, serverError, ok, noContent, paymentRequired } from '@/presentation/helpers/http-helper'
import { ServerError, UnauthorizedError } from '@/presentation/errors'

describe('Http Helper', () => {
  describe('badRequest', () => {
    test('Should return 400 and the error', () => {
      const error = new Error('any_error')
      const httpResponse = badRequest(error)
      expect(httpResponse).toEqual({
        statusCode: 400,
        body: error
      })
    })
  })

  describe('unauthorized', () => {
    test('Should return 401 and UnauthorizedError', () => {
      const httpResponse = unauthorized()
      expect(httpResponse).toEqual({
        statusCode: 401,
        body: new UnauthorizedError()
      })
    })
  })

  describe('forbidden', () => {
    test('Should return 403 and the error', () => {
      const error = new Error('any_error')
      const httpResponse = forbidden(error)
      expect(httpResponse).toEqual({
        statusCode: 403,
        body: error
      })
    })
  })

  describe('notFound', () => {
    test('Should return 404 and the error', () => {
      const error = new Error('any_error')
      const httpResponse = notFound(error)
      expect(httpResponse).toEqual({
        statusCode: 404,
        body: error
      })
    })
  })

  describe('serverError', () => {
    test('Should return 500 and ServerError', () => {
      const error = new Error('any_error')
      const httpResponse = serverError(error)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError(error.stack))
    })
  })

  describe('paymentRequired', () => {
    test('Should return 402 and the error', () => {
      const error = new Error('any_error')
      const httpResponse = paymentRequired(error)
      expect(httpResponse).toEqual({
        statusCode: 402,
        body: error
      })
    })
  })

  describe('ok', () => {
    test('Should return 200 and the data', () => {
      const data = { any: 'data' }
      const httpResponse = ok(data)
      expect(httpResponse).toEqual({
        statusCode: 200,
        body: data
      })
    })
  })

  describe('noContent', () => {
    test('Should return 204 and undefined', () => {
      const httpResponse = noContent()
      expect(httpResponse).toEqual({
        statusCode: 204,
        body: undefined
      })
    })
  })
})
