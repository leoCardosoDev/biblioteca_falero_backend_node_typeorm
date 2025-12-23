import { FastifyReply, FastifyRequest } from 'fastify'

import { Middleware } from '@/presentation/protocols'

export const adaptMiddleware = (middleware: Middleware) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const httpRequest = {
      headers: req.headers as Record<string, string>,
      userId: (req as unknown as Record<string, unknown>).userId as string | undefined,
      role: (req as unknown as Record<string, unknown>).role as string | undefined
    }
    const httpResponse = await middleware.handle(httpRequest)
    if (httpResponse.statusCode === 200) {
      const body = httpResponse.body as { userId?: string, role?: string }
      Object.assign(req, body)
    } else {
      await reply.status(httpResponse.statusCode).send({
        error: (httpResponse.body as Error).message
      })
    }
  }
}
