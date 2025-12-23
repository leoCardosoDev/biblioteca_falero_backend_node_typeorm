import { DataSource, EntityTarget, Repository, ObjectLiteral, DataSourceOptions } from 'typeorm'

export const TypeOrmHelper = {
  client: undefined as unknown as DataSource,

  async connect(config: DataSourceOptions, retries = 10, delay = 3000): Promise<DataSource> {
    this.client = new DataSource(config)

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.client.initialize()
        console.log('Database connected successfully')
        return this.client
      } catch (error) {
        if (attempt === retries) {
          console.error(`Failed to connect to database after ${retries} attempts`)
          throw error
        }
        console.log(`Connection attempt ${attempt}/${retries} failed. Retrying in ${delay / 1000}s...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    return this.client
  },

  async disconnect(): Promise<void> {
    await this.client.destroy()
    this.client = undefined as unknown as DataSource
  },

  getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    return this.client.getRepository(entity)
  }
}
