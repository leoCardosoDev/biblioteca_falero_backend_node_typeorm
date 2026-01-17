
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as IdentityEntities from '@/modules/identity/infra/db/typeorm/entities'
import * as GeographyEntities from '@/modules/geography/infra/db/typeorm/entities'

const { UserTypeOrmEntity: User } = IdentityEntities
const { CityTypeOrmEntity: City } = GeographyEntities

describe('Timestamp Governance Verification', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    // Setup test connection
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [
        ...Object.values(IdentityEntities).filter(e => typeof e === 'function'),
        ...Object.values(GeographyEntities).filter(e => typeof e === 'function')
      ],
      synchronize: true,
      logging: false
    })
    await dataSource.initialize()
  })

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  })

  test('User entity should have UpdateDateColumn and CreateDateColumn configured', async () => {
    const metadata = dataSource.getMetadata(User)

    const createdAtCol = metadata.columns.find(c => c.propertyName === 'createdAt')
    const updatedAtCol = metadata.columns.find(c => c.propertyName === 'updatedAt')

    expect(createdAtCol).toBeDefined()
    expect(updatedAtCol).toBeDefined()

    // Verify they are special date columns
    expect(createdAtCol?.isCreateDate).toBe(true)
    expect(updatedAtCol?.isUpdateDate).toBe(true)
  })

  test('City entity should have createdAt but NO updatedAt', async () => {
    const metadata = dataSource.getMetadata(City)
    const createdAtCol = metadata.columns.find(c => c.propertyName === 'createdAt')
    const updatedAtCol = metadata.columns.find(c => c.propertyName === 'updatedAt')

    expect(createdAtCol).toBeDefined()
    expect(updatedAtCol).toBeUndefined()
  })
})
