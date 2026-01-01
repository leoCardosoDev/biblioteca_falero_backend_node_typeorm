import { DomainEvents, SaveDomainEventRepository } from './domain-events'
import { DomainEvent } from './domain-event'

class SaveDomainEventRepositorySpy implements SaveDomainEventRepository {
  events: DomainEvent[] = []
  async save(event: DomainEvent): Promise<void> {
    this.events.push(event)
  }
}

const makeEvent = (aggregateId: string): DomainEvent => ({
  aggregateId,
  type: 'AnyEvent',
  payload: { any: 'data' },
  createdAt: new Date()
})

describe('DomainEvents', () => {
  beforeEach(() => {
    DomainEvents.clearMarkedAggregates()
  })

  test('Should mark an aggregate for dispatch', () => {
    const aggregateId = 'any_id'
    const event = makeEvent(aggregateId)
    DomainEvents.markAggregateForDispatch(aggregateId, event)
    // No way to check private state directly, but we verify through dispatch
  })

  test('Should dispatch events for an aggregate and save to repository', async () => {
    const aggregateId = 'any_id'
    const event = makeEvent(aggregateId)
    const repositorySpy = new SaveDomainEventRepositorySpy()

    DomainEvents.markAggregateForDispatch(aggregateId, event)
    await DomainEvents.dispatchEventsForAggregate(aggregateId, repositorySpy)

    expect(repositorySpy.events.length).toBe(1)
    expect(repositorySpy.events[0]).toEqual(event)
  })

  test('Should clear events after dispatch', async () => {
    const aggregateId = 'any_id'
    const event = makeEvent(aggregateId)
    const repositorySpy = new SaveDomainEventRepositorySpy()

    DomainEvents.markAggregateForDispatch(aggregateId, event)
    await DomainEvents.dispatchEventsForAggregate(aggregateId, repositorySpy)
    await DomainEvents.dispatchEventsForAggregate(aggregateId, repositorySpy) // Second call

    expect(repositorySpy.events.length).toBe(1)
  })
})
