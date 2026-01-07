import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError, UnauthorizedError, AccessDeniedError } from '@/presentation/errors'
import { DomainError } from '@/domain/errors'

interface FastifyValidationError extends Error {
  code: string
  validation: Array<{
    keyword: string
    message: string
    instancePath?: string
    dataPath?: string
    params?: Record<string, string>
  }>
}

export const errorHandler = (error: Error, request: FastifyRequest, reply: FastifyReply) => {
  let statusCode = reply.statusCode >= 400 ? reply.statusCode : 500
  let type = 'SYSTEM'
  let code = 'INTERNAL_ERROR'
  let message = 'An unexpected error occurred'
  let details: unknown[] | undefined

  if (error instanceof ZodError) {
    statusCode = 400
    type = 'VALIDATION'
    code = 'INVALID_PARAMETERS'
    message = 'One or more fields are invalid.'
    details = error.issues.map(issue => ({
      field: issue.path.join('.'),
      issue: issue.code,
      message: issue.message
    }))
  } else if (error instanceof AppError) {
    statusCode = reply.statusCode >= 400 ? reply.statusCode : 400
    type = getAppErrorType(error)
    code = error.code
    message = error.message
    if (Array.isArray(error.details)) {
      details = error.details as unknown[]
    } else if (error.details) {
      details = [error.details]
    }

  } else if (error instanceof DomainError) {
    statusCode = getDomainStatusCode(error)
    type = getDomainErrorType(error)
    code = getDomainErrorCode(error)
    message = error.message
  } else if ((error as FastifyValidationError).code === 'FST_ERR_VALIDATION') {
    statusCode = 400
    type = 'VALIDATION'
    code = 'INVALID_PARAMETERS'
    message = 'One or more fields are invalid.'
    details = (error as FastifyValidationError).validation?.map(issue => ({
      field: issue.instancePath || issue.dataPath || issue.params?.missingProperty || 'unknown',
      issue: issue.keyword,
      message: issue.message
    }))
  }

  if (type === 'SYSTEM' && process.env.NODE_ENV === 'production') {
    message = 'Internal server error'
  } else if (type === 'SYSTEM') {
    message = error.message || 'Internal server error'
  }

  if (statusCode === 500) {
    request.log.error(error)
  }

  return reply.status(statusCode).send({
    error: {
      type,
      code,
      message,
      details
    }
  })
}

const getAppErrorType = (error: AppError): string => {
  if (error instanceof UnauthorizedError || error instanceof AccessDeniedError) return 'SECURITY'
  if (error.code === 'INTERNAL_ERROR') return 'SYSTEM'
  return 'BUSINESS'
}

const getDomainErrorType = (error: DomainError): string => {
  const name = error.constructor.name
  if (name.includes('Invalid') || name.includes('Required')) return 'VALIDATION'
  if (name.includes('NotFound')) return 'REPOSITORY'
  if (name.includes('InUse') || name.includes('AlreadyExists')) return 'REPOSITORY'
  return 'BUSINESS'
}

const getDomainStatusCode = (error: DomainError): number => {
  const name = error.constructor.name
  if (name.includes('Invalid') || name.includes('Required')) return 400
  if (name.includes('NotFound')) return 404
  if (name.includes('InUse') || name.includes('AlreadyExists')) return 409
  return 400
}

const getDomainErrorCode = (error: DomainError): string => {
  return error.constructor.name
    .replace('Error', '')
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '')
}
