import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { StateTypeOrmRepository } from '@/infra/db/typeorm/state-repository'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'

describe('StateTypeOrmRepository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [State, City, Neighborhood],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const stateRepo = TypeOrmHelper.getRepository(State)
    await stateRepo.clear()
  })

  const makeSut = (): StateTypeOrmRepository => {
    return new StateTypeOrmRepository()
  }

  test('Should return a state on loadByUf success', async () => {
    const sut = makeSut()
    const repo = TypeOrmHelper.getRepository(State)
    await repo.save(repo.create({ name: 'São Paulo', uf: 'SP' }))

    const state = await sut.loadByUf('SP')

    expect(state).toBeTruthy()
    expect(state.name).toBe('São Paulo')
    expect(state.uf).toBe('SP')
  })

  test('Should return null if loadByUf finds nothing', async () => {
    const sut = makeSut()
    const state = await sut.loadByUf('SP')
    expect(state).toBeNull()
  })

  test('Should return a state on loadById success', async () => {
    const sut = makeSut()
    const repo = TypeOrmHelper.getRepository(State)
    const savedState = await repo.save(repo.create({ name: 'São Paulo', uf: 'SP' }))

    const state = await sut.loadById(savedState.id)

    expect(state).toBeTruthy()
    expect(state?.name).toBe('São Paulo')
    expect(state?.uf).toBe('SP')
  })

  test('Should return undefined if loadById finds nothing', async () => {
    const sut = makeSut()
    const state = await sut.loadById('550e8400-e29b-41d4-a716-446655440000')
    expect(state).toBeUndefined()
  })
})
