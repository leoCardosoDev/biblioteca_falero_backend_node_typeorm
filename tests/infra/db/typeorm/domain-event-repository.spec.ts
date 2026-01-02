import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { DomainEventTypeOrmRepository } from '@/infra/db/typeorm/domain-event-repository'
import { DomainEventTypeOrmEntity } from '@/infra/db/typeorm/entities/domain-event-entity'
import { DomainEvent } from '@/domain/events/domain-event'

describe('DomainEventTypeOrmRepository', () => {
  beforeAll(async () => {
    await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [DomainEventTypeOrmEntity],
      synchronize: true
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    const repository = TypeOrmHelper.getRepository(DomainEventTypeOrmEntity)
    await repository.clear()
  })

  const makeSut = (): DomainEventTypeOrmRepository => {
    return new DomainEventTypeOrmRepository()
  }

  test('Should save a domain event on success', async () => {
    const sut = makeSut()
    const event: DomainEvent = {
      aggregateId: 'any_aggregate_id',
      type: 'AnyEvent',
      payload: { any: 'data' },
      createdAt: new Date()
    }

    await sut.save(event)

    const repository = TypeOrmHelper.getRepository(DomainEventTypeOrmEntity)
    const savedEvent = await repository.findOne({ where: { aggregate_id: 'any_aggregate_id' } })

    expect(savedEvent).toBeTruthy()
    expect(savedEvent?.aggregate_id).toBe(event.aggregateId)
    expect(savedEvent?.type).toBe(event.type)
    expect(savedEvent?.payload).toEqual(event.payload)
  })
})
