import { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'

export const setupMiddlewares = (app: FastifyInstance): void => {
  app.register(cors)
}
