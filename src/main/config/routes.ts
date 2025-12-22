import { FastifyInstance } from 'fastify'
import { readdirSync } from 'fs'
import { join } from 'path'

export const setupRoutes = (app: FastifyInstance): void => {
  const routesPath = join(__dirname, '../routes')
  readdirSync(routesPath).map(file => {
    if (!file.endsWith('.map') && (file.endsWith('.ts') || file.endsWith('.js'))) {
       
      const route = require(`../routes/${file}`).default
      app.register(async (instance) => {
        route(instance)
      }, { prefix: '/api' })
    }
  })
}
