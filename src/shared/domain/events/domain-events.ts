import { DomainEvent } from './domain-event'

export interface SaveDomainEventRepository {
  save(event: DomainEvent): Promise<void>
}

export class DomainEvents {
  private static markedAggregates = new Map<string, DomainEvent[]>()

  public static markAggregateForDispatch(aggregateId: string, event: DomainEvent): void {
    const events = this.markedAggregates.get(aggregateId) ?? []
    events.push(event)
    this.markedAggregates.set(aggregateId, events)
  }

  public static async dispatchEventsForAggregate(aggregateId: string, repository: SaveDomainEventRepository): Promise<void> {
    const events = this.markedAggregates.get(aggregateId)
    if (events) {
      for (const event of events) {
        await repository.save(event)
        
      }
      this.markedAggregates.delete(aggregateId)
    }
  }

  public static clearMarkedAggregates(): void {
    this.markedAggregates.clear()
  }
}
