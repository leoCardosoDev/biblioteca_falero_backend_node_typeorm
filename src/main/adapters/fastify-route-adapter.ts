import { Controller } from '@/presentation/protocols'
import { FastifyReply, FastifyRequest } from 'fastify'

export const adaptRoute = (controller: Controller) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const httpRequest = {
      body: req.body,
      params: req.params
    }
    const httpResponse = await controller.handle(httpRequest)
    if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
      await reply.status(httpResponse.statusCode).send(httpResponse.body)
    } else {
      if (httpResponse.statusCode === 500) {
        console.error('[SERVER ERROR]', (httpResponse.body as Error).stack || (httpResponse.body as Error).message)
      }
      await reply.status(httpResponse.statusCode).send({
        error: (httpResponse.body as Error).message
      })
    }
  }
}
