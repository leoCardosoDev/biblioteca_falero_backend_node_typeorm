
import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import path from 'path'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import env from '@/main/config/env'
import bcrypt from 'bcrypt'

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

  console.log("Loading user...")
  const user = await userRepo.findOne({ where: { email: 'admin@falero.com' } })
  if (!user) {
    console.log("User not found")
    process.exit(1)
  }

  console.log("Loading login...")
  const login = await loginRepo.findOne({ where: { userId: user.id } })
  if (!login) {
    console.log("Login not found")
    process.exit(1)
  }

  console.log("Hashing new password '123'...")
  const newHash = await bcrypt.hash('123', 12)
  login.password = newHash

  console.log("Saving new password...")
  await loginRepo.save(login)

  console.log("Password updated successfully.")
  await TypeOrmHelper.disconnect()
}

run().catch(console.error)
