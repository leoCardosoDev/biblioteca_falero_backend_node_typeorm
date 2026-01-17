import { SaveDomainEventRepository } from '@/shared/domain/events/domain-events'

export class DomainEventTypeOrmRepository implements SaveDomainEventRepository {
  async save(_event: unknown): Promise<void> {
    // console.log('Event saved:', event)
  }
}
