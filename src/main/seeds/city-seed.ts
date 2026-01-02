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
  console.log('🌱 Starting City Seed...')

  const config: DataSourceOptions = {
    type: 'mysql',
    host: env.mysqlHost,
    port: env.mysqlPort,
    username: env.mysqlUser,
    password: env.mysqlPassword,
    database: env.mysqlDb,
    entities: [State, City], // Only needed entities for this seed
    synchronize: true // Create table if not exists
  }

  console.log('🔌 Connecting to DB...')
  try {
    await TypeOrmHelper.connect(config)
  } catch (e) {
    console.error('❌ DB Connection Failed:', e)
    process.exit(1)
  }
  console.log('✅ Database connected')

  const stateRepository = TypeOrmHelper.getRepository(State)
  const cityRepository = TypeOrmHelper.getRepository(City)

  console.log('🔍 Loading states...')
  // 1. Load all states to memory map (UF -> StateEntity)
  const states = await stateRepository.find()
  console.log('✅ Specific State loaded:', states.length)
  if (states.length === 0) {
    console.error('❌ No states found! Please run state seed first (Task 017).')
    await TypeOrmHelper.disconnect()
    process.exit(1)
  }

  const stateMap = new Map<string, State>()
  states.forEach(state => stateMap.set(state.uf, state))
  console.log(`✅ Loaded ${states.length} states from DB`)

  // 2. Fetch cities from IBGE
  console.log('🌍 Fetching cities from IBGE API...')
  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
  if (!response.ok) {
    console.error(`❌ Failed to fetch from IBGE: ${response.statusText}`)
    await TypeOrmHelper.disconnect()
    process.exit(1)
  }
  const ibgeCities = await response.json() as IBGECity[]
  console.log(`✅ Fetched ${ibgeCities.length} cities from IBGE`)

  // 3. Check if cities already exist (optional optimization: check count)
  const existingCount = await cityRepository.count()
  if (existingCount >= ibgeCities.length) {
    console.log(`⚠️  Cities likely already populated (Count: ${existingCount}). Skipping...`)
    await TypeOrmHelper.disconnect()
    return
  }

  // 4. Transform and Prepare for Insert
  const citiesToInsert: City[] = []

  for (const ibgeCity of ibgeCities) {
    if (!ibgeCity.microrregiao) {
      console.warn(`⚠️  Skipping city ${ibgeCity.nome} (ID: ${ibgeCity.id}) - Missing microrregiao`)
      continue
    }
    const uf = ibgeCity.microrregiao.mesorregiao.UF.sigla
    const state = stateMap.get(uf)

    if (!state) {
      console.warn(`⚠️  State not found for city ${ibgeCity.nome} (UF: ${uf}). Skipping.`)
      continue
    }

    // Check if distinct city already exists to support idempotency? 
    // Bulk insert with ignore or just simple check. 
    // For simplicity/perf in this seed, we'll construct all and try to save.
    // If we want strict idempotency per city, it's slow. 
    // But since we checked total count, we assume mostly empty or full.
    // Let's create the entity instance.

    // Note: TypeORM create() is sync
    const city = cityRepository.create({
      name: ibgeCity.nome,
      state: state
    })
    citiesToInsert.push(city)
  }

  // 5. Bulk Insert in Chunks
  console.log(`💾 Inserting ${citiesToInsert.length} cities...`)
  const CHUNK_SIZE = 500 // Safe chunk size
  let insertedCount = 0

  for (let i = 0; i < citiesToInsert.length; i += CHUNK_SIZE) {
    const chunk = citiesToInsert.slice(i, i + CHUNK_SIZE)
    // using save with generic can invoke hooks, insert() is faster but bypasses hooks. 
    // We don't have hooks on City, so insert matches 'save' for simple entities usually but 'save' handles relations better if needed.
    // However, we are setting state_id manually. Let's use save({ chunk }) or manual chunk loop using save.

    // To handle uniqueness constraints gracefully (skip duplicates), we typically use .upsert() or .insert().orIgnore().
    // TypeORM .upsert() or .createQueryBuilder().insert().orIgnore()

    await cityRepository.createQueryBuilder()
      .insert()
      .into(City)
      .values(chunk)
      .orIgnore() // Ignores duplicate errors (name, state_id)
      .execute()

    insertedCount += chunk.length
    if (insertedCount % 1000 === 0) {
      console.log(`  ... saved ${insertedCount} / ${citiesToInsert.length}`)
    }
  }

  console.log('✅ Cities inserted successfully!')
  await TypeOrmHelper.disconnect()
}

run().catch(console.error)
