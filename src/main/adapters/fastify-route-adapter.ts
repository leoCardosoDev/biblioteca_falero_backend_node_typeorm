import { Controller } from '@/presentation/protocols'
import { FastifyReply, FastifyRequest } from 'fastify'

import { HttpHeaders } from '@/presentation/protocols/http'

export const adaptRoute = (controller: Controller) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const httpRequest = {
      body: req.body,
      params: req.params,
      headers: req.headers as HttpHeaders,
      query: req.query
    }
    const httpResponse = await controller.handle(httpRequest)
    return reply.status(httpResponse.statusCode).send(httpResponse.body)
  }
}


