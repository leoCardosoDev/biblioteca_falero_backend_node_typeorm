import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'

import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'
import env from '@/main/config/env'

const adminUser = {
  name: 'Leo Cardoso',
  email: 'leocardosodev@gmail.com',
  rg: '12345678',
  cpf: '12345678901',
  dataNascimento: '1990-05-20'
}

const adminPassword = '_Falero@dmin2025'
const adminRole = 'ADMIN'

const run = async (): Promise<void> => {
  console.log('🌱 Starting Admin Seed...')

  const config: DataSourceOptions = {
    type: 'mysql',
    host: env.mysqlHost,
    port: env.mysqlPort,
    username: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDb,
    entities: [UserTypeOrmEntity, LoginTypeOrmEntity],
    synchronize: true
  }

  await TypeOrmHelper.connect(config)
  console.log('✅ Database connected')

  const userRepository = TypeOrmHelper.getRepository(UserTypeOrmEntity)
  const loginRepository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

  const existingUser = await userRepository.findOne({ where: { email: adminUser.email } })
  if (existingUser) {
    console.log('⚠️  Admin user already exists. Skipping...')
    await TypeOrmHelper.disconnect()
    return
  }

  const user = userRepository.create(adminUser)
  const savedUser = await userRepository.save(user)
  console.log(`✅ User created: ${savedUser.name} (ID: ${savedUser.id})`)

  const bcryptAdapter = new BcryptAdapter(12)
  const hashedPassword = await bcryptAdapter.hash(adminPassword)

  const login = loginRepository.create({
    userId: savedUser.id,
    password: hashedPassword,
    role: adminRole
  })
  await loginRepository.save(login)
  console.log(`✅ Login created with role: ${adminRole}`)

  await TypeOrmHelper.disconnect()
  console.log('🎉 Admin Seed completed successfully!')
  console.log('')
  console.log('📧 Email: leocardosodev@gmail.com')
  console.log('🔑 Password: _Falero@dmin2025')
}

run().catch(console.error)
