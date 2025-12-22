import { Controller } from '@/presentation/protocols'
import { FastifyReply, FastifyRequest } from 'fastify'

export const adaptRoute = (controller: Controller) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const httpRequest = {
      body: req.body
    }
    const httpResponse = await controller.handle(httpRequest)
    if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
      await reply.status(httpResponse.statusCode).send(httpResponse.body)
    } else {
      await reply.status(httpResponse.statusCode).send({
        error: (httpResponse.body as Error).message
      })
    }
  }
}
