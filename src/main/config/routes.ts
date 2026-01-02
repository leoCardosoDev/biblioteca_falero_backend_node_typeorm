import { FastifyInstance } from 'fastify'
import { readdirSync } from 'fs'
import { join } from 'path'
import userGovernanceRoutes from '../routes/user-governance-routes'

export default async (app: FastifyInstance): Promise<void> => {
  app.register(userGovernanceRoutes, { prefix: '/api' })

  const routesPath = join(__dirname, '../../main/routes')
  readdirSync(routesPath).map(async file => {
    if (!file.endsWith('.map') && !file.includes('user-governance-routes')) { // Avoid double reg if we manual
      // logic for auto load, but usually i prefer explicit given the explicit manual plan step
      // Checking how other routes are loaded. 
      const route = require(`../routes/${file}`).default
      app.register(async (instance) => {
        await route(instance)
      }, { prefix: '/api' })
    }
  })
}
