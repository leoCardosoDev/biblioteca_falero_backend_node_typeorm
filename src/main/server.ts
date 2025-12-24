import 'module-alias/register'
import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import env from '@/main/config/env'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'

TypeOrmHelper.connect({
  type: 'mysql',
  host: env.mysqlHost,
  port: env.mysqlPort,
  username: env.mysqlUser,
  password: env.mysqlPassword,
  database: env.mysqlDb,
  entities: [UserTypeOrmEntity, LoginTypeOrmEntity],
  synchronize: true
})
  .then(async () => {
    const app = (await import('./config/app')).default
    app.listen({ port: Number(env.port), host: '0.0.0.0' }, () => console.log(`Server running at http://localhost:${env.port}`))
  })
  .catch(console.error)
