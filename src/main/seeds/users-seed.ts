import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import path from 'path'

import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'

import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { BcryptAdapter } from '@/infra/cryptography/bcrypt-adapter'
import env from '@/main/config/env'

const users = [
  {
    userData: {
      name: 'Leo Cardoso',
      email: 'admin@falero.com',
      rg: '12345678',
      cpf: '52899890050',
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
      cpf: '34735363009',
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
      name: 'Professor User',
      email: 'professor@falero.com',
      rg: '99887766',
      cpf: '47737619038',
      gender: 'MALE',
      phone: '5511666666666'
    },
    loginData: {
      role: 'PROFESSOR',
      password: '_Falero@professor2025'
    }
  },
  {
    userData: {
      name: 'Student User',
      email: 'student@falero.com',
      rg: '11223344',
      cpf: '69899428000',
      gender: 'OTHER',
      phone: '5511777777777'
    },
    loginData: {
      role: 'STUDENT',
      password: '_Falero@student2025'
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
    let savedUser = await userRepository.findOne({ where: { email: item.userData.email } })

    if (!savedUser) {
      const user = userRepository.create(item.userData)
      savedUser = await userRepository.save(user)
      console.log(`✅ User created: ${savedUser.name} (${item.loginData.role})`)
    } else {
      console.log(`⚠️ User ${item.userData.email} already exists. Checking login...`)
    }

    // Check if login exists
    const existingLogin = await loginRepository.findOne({ where: { userId: savedUser.id } })

    if (!existingLogin) {
      console.log(`⚠️ Login missing for ${savedUser.email}. Creating...`)
      const hashedPassword = await bcryptAdapter.hash(item.loginData.password)

      // Attempt to find existing role
      const role = await roleRepository.findOne({ where: { slug: item.loginData.role.toUpperCase() } })

      if (!role) {
        throw new Error(`❌ Role ${item.loginData.role} not found. Please run 'npm run seed:roles' first.`)
      }

      const login = loginRepository.create({
        userId: savedUser.id,
        password: hashedPassword,
        roleId: role.id,
        status: 'ACTIVE'
      })

      await loginRepository.save(login)
      console.log(`✅ Login created for ${savedUser.email}`)
    } else {
      console.log(`ℹ️ Login searching... found for ${savedUser.email}`)
      // Optional: Update role if needed
      // const role = await roleRepository.findOne({ where: { slug: item.loginData.role.toUpperCase() } })
      // if (role && existingLogin.roleId !== role.id) {
      //    existingLogin.roleId = role.id;
      //    await loginRepository.save(existingLogin)
      //    console.log(`🔄 Role updated for ${savedUser.email}`)
      // }
    }
  }

  await TypeOrmHelper.disconnect()
  console.log('🎉 Consolidated Users Seed completed successfully!')
}

run().catch(console.error)
