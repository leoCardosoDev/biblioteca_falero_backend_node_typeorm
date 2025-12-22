import { DataSource, DataSourceOptions, EntityTarget, Repository, ObjectLiteral } from 'typeorm'

export const TypeOrmHelper = {
  client: null as unknown as DataSource,

  async connect(options: DataSourceOptions): Promise<void> {
    this.client = new DataSource(options)
    await this.client.initialize()
  },

  async disconnect(): Promise<void> {
    await this.client.destroy()
    this.client = null as unknown as DataSource
  },

  getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> {
    return this.client.getRepository(entity)
  }
}
