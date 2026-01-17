import { FastifyInstance } from 'fastify'
import { readdirSync } from 'fs'
import { join } from 'path'
import userGovernanceRoutes from '../routes/user-governance-routes'

export default async (app: FastifyInstance): Promise<void> => {
  app.register(userGovernanceRoutes, { prefix: '/api' })

  const routesPath = join(__dirname, '../../main/routes')
  await Promise.all(readdirSync(routesPath).map(async file => {
    if (!file.endsWith('.map') && !file.includes('user-governance-routes')) {
      const route = (await import(`../routes/${file}`)).default
      app.register(async (instance) => {
        await route(instance)
      }, { prefix: '/api' })
    }
  }))
}
