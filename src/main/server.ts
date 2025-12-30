import moduleAlias from 'module-alias';
import path from 'path';

const baseDir = __dirname.includes('dist') ? 'dist' : 'src';
moduleAlias.addAlias('@', path.resolve(baseDir));

import 'reflect-metadata';
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import env from '@/main/config/env'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { SessionTypeOrmEntity } from '@/infra/db/typeorm/entities/session-entity'

TypeOrmHelper.connect({
  type: 'mysql',
  host: env.mysqlHost,
  port: Number(env.mysqlPort),
  username: env.mysqlUser,
  password: env.mysqlPassword,
  database: env.mysqlDb,
  entities: [UserTypeOrmEntity, LoginTypeOrmEntity, SessionTypeOrmEntity],
  synchronize: true
})
  .then(async () => {
    const { setupApp } = await import('./config/app')
    const app = await setupApp()
    app.listen({ port: Number(env.port), host: '0.0.0.0' }, () => {
      console.log(`Server running at http://localhost:${env.port}`)
    })
  })
  .catch(console.error)
