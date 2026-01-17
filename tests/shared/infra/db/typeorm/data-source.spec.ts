import { DataSource } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'

describe('AppDataSource', () => {
  const oldEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...oldEnv }
  })

  afterAll(() => {
    process.env = oldEnv
  })

  test('Should use environment variables if defined', () => {
    process.env.MYSQL_HOST = 'any_host'
    process.env.MYSQL_PORT = '1234'
    process.env.MYSQL_USER = 'any_user'
    process.env.MYSQL_PASSWORD = 'any_password'
    process.env.MYSQL_DATABASE = 'any_db'

    let sut: DataSource = {} as DataSource
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sut = require('@/shared/infra/db/typeorm/data-source').AppDataSource
    })

    const options = sut.options as MysqlConnectionOptions
    expect(options.host).toBe('any_host')
    expect(options.port).toBe(1234)
    expect(options.username).toBe('any_user')
    expect(options.password).toBe('any_password')
    expect(options.database).toBe('any_db')
  })

  test('Should use default values if environment variables are not defined', () => {
    delete process.env.MYSQL_HOST
    delete process.env.MYSQL_PORT
    delete process.env.MYSQL_USER
    delete process.env.MYSQL_PASSWORD
    delete process.env.MYSQL_DATABASE

    let sut: DataSource = {} as DataSource
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      sut = require('@/shared/infra/db/typeorm/data-source').AppDataSource
    })

    const options = sut.options as MysqlConnectionOptions
    expect(options.host).toBe('localhost')
    expect(options.port).toBe(3306)
    expect(options.username).toBe('root')
    expect(options.password).toBe('root')
    expect(options.database).toBe('biblioteca')
  })
})
