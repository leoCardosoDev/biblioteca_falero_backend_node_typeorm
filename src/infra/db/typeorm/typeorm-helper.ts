import { DataSource, EntityTarget, Repository, ObjectLiteral, DataSourceOptions } from 'typeorm'

export const TypeOrmHelper = {
  client: undefined as unknown as DataSource,

  async connect(config: DataSourceOptions): Promise<void> {
    this.client = new DataSource(config)
    await this.client.initialize()
  },

  async disconnect(): Promise<void> {
    await this.client.destroy()
    this.client = undefined as unknown as DataSource
  },

  getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    return this.client.getRepository(entity)
  }
}
