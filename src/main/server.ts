import moduleAlias from 'module-alias';
import path from 'path';

const baseDir = __dirname.includes('dist') ? 'dist' : 'src';
moduleAlias.addAlias('@', path.resolve(baseDir));

import 'reflect-metadata';
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import env from '@/main/config/env'

TypeOrmHelper.connect({
  type: 'mysql',
  host: env.mysqlHost,
  port: Number(env.mysqlPort),
  username: env.mysqlUser,
  password: env.mysqlPassword,
  database: env.mysqlDb,
  entities: [path.join(__dirname, '../modules/**/infra/db/typeorm/entities/*.{ts,js}')],
  synchronize: false
})
  .then(async () => {
    const { setupApp } = await import('./config/app')
    const app = await setupApp()
    app.listen({ port: Number(env.port), host: '0.0.0.0' }, () => {

    })
  })
  .catch(console.error)
