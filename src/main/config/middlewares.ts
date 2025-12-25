import { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'

export const setupMiddlewares = async (app: FastifyInstance): Promise<void> => {
  await app.register(cors)
  await app.register(rateLimit, {
    global: false
  })
}
