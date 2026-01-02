import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import path from 'path'

import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { SessionTypeOrmEntity } from '@/infra/db/typeorm/entities/session-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'
import env from '@/main/config/env'

const users = [
  {
    userData: {
      name: 'Leo Cardoso',
      email: 'admin@falero.com',
      rg: '12345678',
      cpf: '20073296031',
      gender: 'MALE',
      phone: '5511999999999'
    },
    loginData: {
      role: 'ADMIN',
      password: '_Falero@admin2025'
    }
  },
  {
    userData: {
      name: 'Librarian User',
      email: 'librarian@falero.com',
      rg: '87654321',
      cpf: '93271203024',
      gender: 'FEMALE',
      phone: '5511888888888'
    },
    loginData: {
      role: 'LIBRARIAN',
      password: '_Falero@librarian2025'
    }
  },
  {
    userData: {
      name: 'Member User',
      email: 'user@falero.com',
      rg: '11223344',
      cpf: '17480131062',
      gender: 'OTHER',
      phone: '5511777777777'
    },
    loginData: {
      role: 'MEMBER',
      password: '_Falero@member2025'
    }
  }
]

const run = async (): Promise<void> => {
  console.log('🌱 Starting Consolidated Users Seed...')

  const config: DataSourceOptions = {
    type: 'mysql',
    host: env.mysqlHost,
    port: env.mysqlPort,
    username: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDb,
    entities: [path.join(__dirname, '../../infra/db/typeorm/entities/*.{ts,js}')],
    synchronize: true
  }

  await TypeOrmHelper.connect(config)
  console.log('✅ Database connected')

  const userRepository = TypeOrmHelper.getRepository(UserTypeOrmEntity)
  const loginRepository = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
  const roleRepository = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
  const bcryptAdapter = new BcryptAdapter(12)

  for (const item of users) {
    const existingUser = await userRepository.findOne({ where: { email: item.userData.email } })

    if (existingUser) {
      console.log(`⚠️ User ${item.userData.email} already exists. Skipping...`)
      continue
    }

    const user = userRepository.create(item.userData)
    const savedUser = await userRepository.save(user)
    console.log(`✅ User created: ${savedUser.name} (${item.loginData.role})`)

    const hashedPassword = await bcryptAdapter.hash(item.loginData.password)

    // Attempt to find or create role
    let role = await roleRepository.findOne({ where: { slug: item.loginData.role.toUpperCase() } })
    if (!role) {
      role = roleRepository.create({
        slug: item.loginData.role.toUpperCase(),
        description: `Default ${item.loginData.role} role`
      })
      await roleRepository.save(role)
    }

    const login = loginRepository.create({
      userId: savedUser.id,
      password: hashedPassword,
      roleId: role.id,
      status: 'ACTIVE'
    })

    await loginRepository.save(login)
    console.log(`✅ Login created for ${savedUser.email}`)
  }

  await TypeOrmHelper.disconnect()
  console.log('🎉 Consolidated Users Seed completed successfully!')
}

run().catch(console.error)
