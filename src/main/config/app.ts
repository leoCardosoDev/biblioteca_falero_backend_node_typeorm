import fastify from 'fastify'
import { setupRoutes } from './routes'
import { setupMiddlewares } from './middlewares'

const app = fastify()
setupMiddlewares(app)
setupRoutes(app)
export default app
