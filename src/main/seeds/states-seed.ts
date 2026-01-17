import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'
import crypto from 'node:crypto'

import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { StateTypeOrmEntity as State } from '@/modules/geography/infra/db/typeorm/entities/state'
import env from '@/main/config/env'

const statesData = [
  { name: 'Acre', uf: 'AC' },
  { name: 'Alagoas', uf: 'AL' },
  { name: 'Amapá', uf: 'AP' },
  { name: 'Amazonas', uf: 'AM' },
  { name: 'Bahia', uf: 'BA' },
  { name: 'Ceará', uf: 'CE' },
  { name: 'Distrito Federal', uf: 'DF' },
  { name: 'Espírito Santo', uf: 'ES' },
  { name: 'Goiás', uf: 'GO' },
  { name: 'Maranhão', uf: 'MA' },
  { name: 'Mato Grosso', uf: 'MT' },
  { name: 'Mato Grosso do Sul', uf: 'MS' },
  { name: 'Minas Gerais', uf: 'MG' },
  { name: 'Pará', uf: 'PA' },
  { name: 'Paraíba', uf: 'PB' },
  { name: 'Paraná', uf: 'PR' },
  { name: 'Pernambuco', uf: 'PE' },
  { name: 'Piauí', uf: 'PI' },
  { name: 'Rio de Janeiro', uf: 'RJ' },
  { name: 'Rio Grande do Norte', uf: 'RN' },
  { name: 'Rio Grande do Sul', uf: 'RS' },
  { name: 'Rondônia', uf: 'RO' },
  { name: 'Roraima', uf: 'RR' },
  { name: 'Santa Catarina', uf: 'SC' },
  { name: 'São Paulo', uf: 'SP' },
  { name: 'Sergipe', uf: 'SE' },
  { name: 'Tocantins', uf: 'TO' }
]

const run = async (): Promise<void> => {
  const config: DataSourceOptions = {
    type: 'mysql',
    host: env.mysqlHost,
    port: env.mysqlPort,
    username: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDb,
    entities: [State],
    synchronize: true
  }

  await TypeOrmHelper.connect(config)
  const stateRepo = TypeOrmHelper.getRepository(State)

  console.log('🌱 Seeding states...')

  for (const data of statesData) {
    let state = await stateRepo.findOne({ where: { uf: data.uf } })

    if (state) {
      state.name = data.name
    } else {
      state = stateRepo.create({
        id: crypto.randomUUID(),
        ...data
      })
    }

    await stateRepo.save(state)
  }

  console.log('✅ States seeded successfully!')
  await TypeOrmHelper.disconnect()
}

run().catch(console.error)
