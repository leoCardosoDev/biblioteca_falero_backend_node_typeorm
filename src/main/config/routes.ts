import { Express, Router } from 'express'
import { readdirSync } from 'fs'
import { join } from 'path'

export const setupRoutes = (app: Express): void => {
  const router = Router()
  app.use('/api', router)

  // Adjusted path to find routes relative to dist/src/main/config or src/main/config
  // Assuming executing from root with ts-node or built
  const routesPath = join(__dirname, '../routes')

  readdirSync(routesPath).map(file => {
    if (!file.endsWith('.map') && (file.endsWith('.ts') || file.endsWith('.js'))) {

      require(`../routes/${file}`).default(router)
    }
  })
}
