import 'module-alias/register'
import { DataSourceOptions } from 'typeorm'

import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import env from '@/main/config/env'

interface IBGECity {
  id: number
  nome: string
  microrregiao: {
    mesorregiao: {
      UF: {
        id: number
        sigla: string
        nome: string
      }
    }
  }
}

const run = async (): Promise<void> => {

  const config: DataSourceOptions = {
    type: 'mysql',
    host: env.mysqlHost,
    port: env.mysqlPort,
    username: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDb,
    entities: [State, City],
    synchronize: true
  }

  try {
    await TypeOrmHelper.connect(config)
  } catch (_e) {
    process.exit(1)
  }

  const stateRepository = TypeOrmHelper.getRepository(State)
  const cityRepository = TypeOrmHelper.getRepository(City)

  const states = await stateRepository.find()

  if (states.length === 0) {
    await TypeOrmHelper.disconnect()
    process.exit(1)
  }

  const stateMap = new Map<string, State>()
  states.forEach(state => stateMap.set(state.uf, state))

  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
  if (!response.ok) {

    await TypeOrmHelper.disconnect()
    process.exit(1)
  }
  const ibgeCities = await response.json() as IBGECity[]

  const existingCount = await cityRepository.count()
  if (existingCount >= ibgeCities.length) {
    await TypeOrmHelper.disconnect()
    return
  }

  const citiesToInsert: City[] = []

  for (const ibgeCity of ibgeCities) {
    if (!ibgeCity.microrregiao) {
      continue
    }
    const uf = ibgeCity.microrregiao.mesorregiao.UF.sigla
    const state = stateMap.get(uf)

    if (!state) {
      continue
    }

    const city = cityRepository.create({
      name: ibgeCity.nome,
      state: state
    })
    citiesToInsert.push(city)
  }

  const CHUNK_SIZE = 500
  let insertedCount = 0

  for (let i = 0; i < citiesToInsert.length; i += CHUNK_SIZE) {
    const chunk = citiesToInsert.slice(i, i + CHUNK_SIZE)

    await cityRepository.createQueryBuilder()
      .insert()
      .into(City)
      .values(chunk)
      .orIgnore()
      .execute()

    insertedCount += chunk.length
    if (insertedCount % 1000 === 0) {
      void insertedCount
    }
  }

  await TypeOrmHelper.disconnect()
}

run().catch(console.error)
