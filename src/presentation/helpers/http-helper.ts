import { HttpResponse } from '@/presentation/protocols/http'
import { ServerError, AppError, UnauthorizedError } from '@/presentation/errors'
import { DomainError } from '@/domain/errors'

interface ErrorResponseBody {
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

const domainErrorCodeMap: Record<string, string> = {
  EmailInUseError: 'CONFLICT',
  CpfInUseError: 'CONFLICT',
  NotFoundError: 'NOT_FOUND',
  InvalidEmailError: 'INVALID_PARAM',
  InvalidCpfError: 'INVALID_PARAM',
  InvalidNameError: 'INVALID_PARAM',
  InvalidRgError: 'INVALID_PARAM',
  InvalidBirthDateError: 'INVALID_PARAM',
  InvalidAddressError: 'INVALID_PARAM',
  InvalidIdError: 'INVALID_PARAM',
  InvalidPasswordError: 'INVALID_PARAM',
  InvalidUserRoleError: 'INVALID_PARAM',
  InvalidUserStatusError: 'INVALID_PARAM'
}

const safeMessageMap: Record<string, string> = {
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  MISSING_PARAM: 'Missing required parameter',
  INVALID_PARAM: 'Invalid parameter',
  CONFLICT: 'Resource already exists'
}

const formatError = (error: Error, fallbackCode: string): ErrorResponseBody => {
  let code = fallbackCode
  let details: unknown
  let message: string

  if (error instanceof AppError) {
    code = error.code
    message = error.message
    details = error.details
  } else if (error instanceof DomainError) {
    code = domainErrorCodeMap[error.name] ?? fallbackCode
    message = error.message
  } else {
    // Security: Do NOT expose original message from generic errors
    message = safeMessageMap[fallbackCode] ?? 'An error occurred'
  }

  return {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  }
}

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: formatError(error, 'BAD_REQUEST')
})

export const unauthorized = (): HttpResponse => ({
  statusCode: 401,
  body: formatError(new UnauthorizedError(), 'UNAUTHORIZED')
})

export const forbidden = (error: Error): HttpResponse => ({
  statusCode: 403,
  body: formatError(error, 'FORBIDDEN')
})

export const notFound = (error: Error): HttpResponse => ({
  statusCode: 404,
  body: formatError(error, 'NOT_FOUND')
})

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: formatError(new ServerError(error.stack), 'INTERNAL_ERROR')
})

export const ok = (data: unknown): HttpResponse => ({
  statusCode: 200,
  body: data
})

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  body: undefined
})

export const paymentRequired = (error: Error): HttpResponse => ({
  statusCode: 402,
  body: formatError(error, 'PAYMENT_REQUIRED')
})
