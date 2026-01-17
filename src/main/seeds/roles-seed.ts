import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import path from 'path'

import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { RoleTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/role-entity'
import env from '@/main/config/env'

const roles = [
  {
    slug: 'ADMIN',
    description: 'Administrator with full access',
    powerLevel: 100
  },
  {
    slug: 'LIBRARIAN',
    description: 'Librarian with management access',
    powerLevel: 50
  },
  {
    slug: 'PROFESSOR',
    description: 'Professor/Teacher role',
    powerLevel: 10
  },
  {
    slug: 'STUDENT',
    description: 'Student role',
    powerLevel: 0
  }
]

const run = async (): Promise<void> => {

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

  const roleRepository = TypeOrmHelper.getRepository(RoleTypeOrmEntity)

  for (const roleData of roles) {
    let role = await roleRepository.findOne({ where: { slug: roleData.slug } })

    if (role) {
      
      role.description = roleData.description
      role.powerLevel = roleData.powerLevel
    } else {
      
      role = roleRepository.create(roleData)
    }

    await roleRepository.save(role)
  }

  await TypeOrmHelper.disconnect()
  
}

run().catch(console.error)
