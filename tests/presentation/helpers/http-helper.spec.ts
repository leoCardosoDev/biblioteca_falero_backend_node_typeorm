import { badRequest, unauthorized, forbidden, notFound, serverError, ok, noContent, paymentRequired } from '@/presentation/helpers/http-helper'
import { MissingParamError, AccessDeniedError } from '@/presentation/errors'
import { DomainError, EmailInUseError, NotFoundError } from '@/domain/errors'

describe('Http Helper', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('formatError security', () => {
    test('Should NOT expose original message from generic Error', () => {
      const sensitiveError = new Error('secret_api_key=ABC123')
      const httpResponse = badRequest(sensitiveError)

      expect(httpResponse.statusCode).toBe(400)
      expect((httpResponse.body as { error: { message: string } }).error.message).toBe('Invalid request')
      expect((httpResponse.body as { error: { message: string } }).error.message).not.toContain('secret_api_key')
    })

    test('Should expose message from AppError (controlled)', () => {
      const appError = new MissingParamError('email')
      const httpResponse = badRequest(appError)

      expect(httpResponse.statusCode).toBe(400)
      expect((httpResponse.body as { error: { message: string } }).error.message).toBe('Missing param: email')
    })

    test('Should expose message from DomainError (controlled)', () => {
      const domainError = new EmailInUseError()
      const httpResponse = forbidden(domainError)

      expect(httpResponse.statusCode).toBe(403)
      expect((httpResponse.body as { error: { message: string; code: string } }).error.message).toBe('The received email is already in use')
      expect((httpResponse.body as { error: { code: string } }).error.code).toBe('CONFLICT')
    })
  })

  describe('serverError security', () => {
    test('Should NEVER return original error message', () => {
      const sensitiveError = new Error('Database connection string: mysql://user:password@host')
      const httpResponse = serverError(sensitiveError)

      expect(httpResponse.statusCode).toBe(500)
      expect((httpResponse.body as { error: { message: string } }).error.message).toBe('Internal server error')
      expect((httpResponse.body as { error: { message: string } }).error.message).not.toContain('mysql')
      expect((httpResponse.body as { error: { message: string } }).error.message).not.toContain('password')
    })

    test('Should have code INTERNAL_ERROR', () => {
      const httpResponse = serverError(new Error())

      expect((httpResponse.body as { error: { code: string } }).error.code).toBe('INTERNAL_ERROR')
    })
  })

  describe('DomainError fallback', () => {
    class UnmappedDomainError extends DomainError {
      constructor() {
        super('This domain error is not in the map')
      }
    }

    test('Should use fallbackCode for unmapped DomainError', () => {
      const unmappedError = new UnmappedDomainError()
      const httpResponse = badRequest(unmappedError)

      expect(httpResponse.statusCode).toBe(400)
      expect((httpResponse.body as { error: { code: string } }).error.code).toBe('BAD_REQUEST')
      expect((httpResponse.body as { error: { message: string } }).error.message).toBe('This domain error is not in the map')
    })
  })

  describe('badRequest', () => {
    test('Should return 400 with correct error structure', () => {
      const error = new MissingParamError('field')
      const httpResponse = badRequest(error)

      expect(httpResponse.statusCode).toBe(400)
      const errorBody = (httpResponse.body as { error: { code: string; message: string; timestamp: string } }).error
      expect(errorBody.code).toBe('MISSING_PARAM')
      expect(errorBody.message).toBe('Missing param: field')
      expect(errorBody.timestamp).toBe('2025-01-01T00:00:00.000Z')
    })
  })

  describe('unauthorized', () => {
    test('Should return 401 with UNAUTHORIZED code', () => {
      const httpResponse = unauthorized()

      expect(httpResponse.statusCode).toBe(401)
      expect((httpResponse.body as { error: { code: string } }).error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('forbidden', () => {
    test('Should return 403 with FORBIDDEN code for AccessDeniedError', () => {
      const httpResponse = forbidden(new AccessDeniedError())

      expect(httpResponse.statusCode).toBe(403)
      expect((httpResponse.body as { error: { code: string } }).error.code).toBe('FORBIDDEN')
    })
  })

  describe('notFound', () => {
    test('Should return 404 with NOT_FOUND code', () => {
      const httpResponse = notFound(new NotFoundError('User'))

      expect(httpResponse.statusCode).toBe(404)
      expect((httpResponse.body as { error: { code: string } }).error.code).toBe('NOT_FOUND')
    })
  })

  describe('ok', () => {
    test('Should return 200 with data', () => {
      const data = { id: '123', name: 'Test' }
      const httpResponse = ok(data)

      expect(httpResponse.statusCode).toBe(200)
      expect(httpResponse.body).toEqual(data)
    })
  })

  describe('noContent', () => {
    test('Should return 204 with undefined body', () => {
      const httpResponse = noContent()

      expect(httpResponse.statusCode).toBe(204)
      expect(httpResponse.body).toBeUndefined()
    })
  })

  describe('paymentRequired', () => {
    test('Should return 402 with default "An error occurred" message for unknown code', () => {
      const httpResponse = paymentRequired(new Error('Any error'))

      expect(httpResponse.statusCode).toBe(402)
      const errorBody = (httpResponse.body as { error: { code: string; message: string; timestamp: string } }).error
      expect(errorBody.code).toBe('PAYMENT_REQUIRED')
      expect(errorBody.message).toBe('An error occurred')
    })
  })
})
