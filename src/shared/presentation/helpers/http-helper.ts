import { HttpResponse } from '@/shared/presentation/protocols'
import { ServerError, UnauthorizedError } from '@/shared/presentation/errors'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const forbidden = (error: Error): HttpResponse => ({
  statusCode: 403,
  body: error
})

export const paymentRequired = (error: Error): HttpResponse => ({
  statusCode: 402,
  body: error
})

export const unauthorized = (): HttpResponse => ({
  statusCode: 401,
  body: new UnauthorizedError()
})

export const notFound = (error: Error): HttpResponse => ({
  statusCode: 404,
  body: error
})

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: new ServerError(error.stack as string)
})

export const ok = <T = unknown>(data: T): HttpResponse<T> => ({
  statusCode: 200,
  body: data
})

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  body: null
})
