import fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import setupRoutes from './routes'
import { setupMiddlewares } from './middlewares'
import { swaggerConfig } from './swagger'
import { errorHandler } from './error-handler'
import { citySchema, stateSchema } from './schemas'

const app = fastify({ logger: process.env.NODE_ENV !== 'test' })
app.setErrorHandler(errorHandler)
app.addSchema(citySchema)
app.addSchema(stateSchema)

const setupSwagger = async (): Promise<void> => {

  await app.register(swagger, swaggerConfig)
  await app.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  })
}

export const setupApp = async (): Promise<typeof app> => {
  await setupMiddlewares(app)
  await setupSwagger()
  setupRoutes(app)
  return app
}

export default app
