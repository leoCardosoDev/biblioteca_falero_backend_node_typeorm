
import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import path from 'path'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import env from '@/main/config/env'
import bcrypt from 'bcrypt'

const run = async () => {
  try {
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

    console.log('Connecting to DB...')
    await TypeOrmHelper.connect(config)
    console.log('Connected.')

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

    const email = 'admin@falero.com'
    console.log(`Searching for user with email: ${email}`)

    const user = await userRepo.findOne({ where: { email } })

    if (!user) {
      console.log('User NOT FOUND.')
    } else {
      console.log('User FOUND:', { id: user.id, email: user.email, status: user.status })

      const login = await loginRepo.findOne({ where: { userId: user.id } })
      if (!login) {
        console.log('Login entry NOT FOUND for this user.')
      } else {
        console.log('Login entry FOUND:', { id: login.id, status: login.status })

        const passwordTarget = '123'
        const isMatch = await bcrypt.compare(passwordTarget, login.password)
        console.log(`Password verification for '${passwordTarget}': ${isMatch ? 'MATCH' : 'FAIL'}`)
      }
    }

    await TypeOrmHelper.disconnect()
    console.log('Disconnected.')
  } catch (e) {
    console.error('Error:', e)
  }
}

run()
