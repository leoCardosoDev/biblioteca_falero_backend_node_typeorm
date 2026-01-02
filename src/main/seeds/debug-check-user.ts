import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import path from 'path'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import env from '@/main/config/env'

const run = async () => {
  const config: DataSourceOptions = {
    type: 'mysql',
    host: env.mysqlHost,
    port: env.mysqlPort,
    username: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDb,
    entities: [path.join(__dirname, '../../infra/db/typeorm/entities/*.{ts,js}')],
    synchronize: false
  }

  await TypeOrmHelper.connect(config)
  const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
  const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

  const user = await userRepo.findOne({ where: { email: 'admin@falero.com' } })
  console.log('User:', JSON.stringify(user, null, 2))

  if (user) {
    const login = await loginRepo.findOne({ where: { userId: user.id } })
    console.log('Login:', JSON.stringify(login, null, 2))
  }
  await TypeOrmHelper.disconnect()
}

run().catch(console.error)
